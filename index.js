'use strict';

module.exports = (config, storage = null) => {
    let storageObject;
    if (typeof storage === 'string' || storage instanceof String) {
        storageObject = new require(`auzy-storage-${storage}`)(config.storage);
    } else {
        // Object storage is non-persistent storage for sessions
        let objectStorage = new require('./ObjectStorage')(config.storage);
        storageObject = storage || objectStorage;
    }
    const session = new require('./Session')(storageObject, config.session);

    return async (req, res, next) => {
        await session.loadSession(req);
        next();
    };
};
