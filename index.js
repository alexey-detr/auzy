'use strict';

const SessionRequestHandler = require('./lib/SessionRequestHandler');

const adapters = {
    connect: require('./lib/adapters/ConnectAdapter'),
    express: require('./lib/adapters/ExpressAdapter'),
    koa: require('./lib/adapters/KoaAdapter'),
    restify: require('./lib/adapters/RestifyAdapter'),
};

const transports = {
    header: require('./lib/transports/HeaderTransport'),
};

function createAdapter(framework, req, res) {
    let adapter = null;
    if (adapters[framework]) {
        adapter = new adapters[framework](req, res);
    }
    return adapter;
}

function prepareTransportConfig(transportName, globalConfig) {
    switch (transportName) {
        case 'header':
            return Object.assign({}, {headerName: globalConfig.session.sessionName}, globalConfig.transport);
        case 'cookie':
            return Object.assign({}, {cookieName: globalConfig.session.sessionName}, globalConfig.transport);
    }
}

function createTransport(name, adapter, config) {
    let transport = null;
    if (transports[name]) {
        transport = new transports[name](adapter, config);
    }
    return transport;
}

const defaultMiddleware = (storage, frameworkName, transportName, config) => {
    return async (req, res, next) => {
        const adapter = createAdapter(frameworkName, req, res);
        const transportConfig = prepareTransportConfig(transportName, config);
        const transport = createTransport(transportName, adapter, transportConfig);
        req.session = new SessionRequestHandler(req, res, storage, adapter, transport, config.session);
        await req.session.loadSession();
        next();
    };
};

const koaMiddleware = (storage, frameworkName, transportName, config) => {
    return async (ctx, next) => {
        const adapter = createAdapter(frameworkName, ctx);
        const transportConfig = prepareTransportConfig(transportName, config);
        const transport = createTransport(transportName, adapter, transportConfig);
        ctx.session = new SessionRequestHandler(ctx.request, ctx.response, storage, adapter, transport, config.session);
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

module.exports = (config, hints) => {
    let storageObject;
    const {
        storage = null,
        framework = 'default',
        transport = null,
    } = hints;

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

    return frameworkMiddleware[framework](storageObject, framework, transport, config);
};
