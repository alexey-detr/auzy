'use strict';

module.exports = class ObjectStorage {
    constructor() {
        this.data = {};
    }

    set(key, value, expire = null) {
        this.data[key] = value;
        return Promise.resolve();
    }

    get(key) {
        return Promise.resolve(this.data[key]);
    }

    del(key) {
        try {
            delete this.data[key];
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve();
    }
};
