'use strict';

class ObjectStorage {
    constructor() {
        this.data = {};
    }

    set(key, value, ttl = null) {
        if (ttl) {
            return Promise.reject(new Error('TTL is not supported for non-persistent object storage.'));
        }
        this.data[key] = value;
        return Promise.resolve();
    }

    get(key) {
        return Promise.resolve(this.data[key]);
    }

    del(key) {
        delete this.data[key];
        return Promise.resolve();
    }
}

module.exports = ObjectStorage;
