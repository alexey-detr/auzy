'use strict';

const SessionRequestHandler = require('./SessionRequestHandler');

const defaultMiddleware = (storageObject, config) => {
    return async (req, res, next) => {
        req.session = new SessionRequestHandler(req, res, storageObject, config.session);
        await req.session.loadSession();
        next();
    };
};

const koaMiddleware = (storageObject, config) => {
    return async (ctx, next) => {
        ctx.session = new SessionRequestHandler(ctx.request, ctx.response, storageObject, config.session);
        await ctx.session.loadSession();
        await next();
    };
};

const frameworkMiddleware = {
    default: defaultMiddleware,
    restify: defaultMiddleware,
    express: defaultMiddleware,
    connect: defaultMiddleware,
    koa: koaMiddleware,
};

module.exports = (config, {storage = null, framework = 'default'}) => {
    let storageObject;
    if (typeof storage === 'string' || storage instanceof String) {
        const auzyStorage = require(`auzy-storage-${storage}`);
        storageObject = new auzyStorage(config.storage);
    } else {
        // Object storage is a non-persistent storage for sessions
        const ObjectStorage = require('./ObjectStorage');
        const objectStorage = new ObjectStorage(config.storage);
        storageObject = storage || objectStorage;
    }

    if (!frameworkMiddleware[framework]) {
        const middleware = `Framework ${framework} is not supported, please specify one of ` +
            `this: ${Object.keys(frameworkMiddleware).join(', ')}`;
        throw new Error(middleware);
    }

    return frameworkMiddleware[framework](storageObject, config);
};
