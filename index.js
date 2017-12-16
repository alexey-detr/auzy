'use strict';

const SessionRequestHandler = require('./lib/SessionRequestHandler');

const defaultMiddleware = (storage, framework, config) => {
    return async (req, res, next) => {
        const adapter = createAdapter(framework, req, res);
        req.session = new SessionRequestHandler(req, res, storage, adapter, config.session);
        await req.session.loadSession();
        next();
    };
};

const koaMiddleware = (storage, framework, config) => {
    return async (ctx, next) => {
        const adapter = createAdapter(framework, ctx);
        ctx.session = new SessionRequestHandler(ctx.request, ctx.response, storage, adapter, config.session);
        await ctx.session.loadSession();
        await next();
    };
};

const frameworkMiddleware = {
    default: defaultMiddleware,
    connect: defaultMiddleware,
    express: defaultMiddleware,
    koa: koaMiddleware,
    restify: defaultMiddleware,
};

const adapters = {
    connect: require('./lib/adapters/ConnectAdapter'),
    express: require('./lib/adapters/ExpressAdapter'),
    koa: require('./lib/adapters/KoaAdapter'),
    restify: require('./lib/adapters/RestifyAdapter'),
};

function createAdapter(framework, req, res) {
    let adapter = null;
    if (adapters[framework]) {
        adapter = new adapters[framework](req, res);
    }
    return adapter;
}

module.exports = (config, {storage = null, framework = 'default'}) => {
    let storageObject;
    if (typeof storage === 'string' || storage instanceof String) {
        const auzyStorage = require(`auzy-storage-${storage}`);
        storageObject = new auzyStorage(config.storage);
    } else {
        // Object storage is a non-persistent storage for sessions
        const ObjectStorage = require('./lib/ObjectStorage');
        const objectStorage = new ObjectStorage(config.storage);
        storageObject = storage || objectStorage;
    }

    if (framework && !frameworkMiddleware[framework]) {
        const middleware = `Framework ${framework} is not supported, please specify one of ` +
            `this: ${Object.keys(frameworkMiddleware).join(', ')}`;
        throw new Error(middleware);
    }

    return frameworkMiddleware[framework](storageObject, framework, config);
};
