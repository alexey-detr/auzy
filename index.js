'use strict';

module.exports = (config, storage = null) => {
    let storageObject;
    if (typeof storage === 'string' || storage instanceof String) {
        const auzyStorage = require(`auzy-storage-${storage}`);
        storageObject = new auzyStorage(config.storage);
    } else {
        // Object storage is non-persistent storage for sessions
        const ObjectStorage = require('./ObjectStorage');
        const objectStorage = new ObjectStorage(config.storage);
        storageObject = storage || objectStorage;
    }
    const Session = require('./Session');
    const session = new Session(storageObject, config.session);

    return async (req, res, next) => {
        req.session = session;
        await session.loadSession(req);
        next();
    };
};
