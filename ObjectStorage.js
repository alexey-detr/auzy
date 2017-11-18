'use strict';

module.exports = class ObjectStorage {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        this.data[key] = value;
        return Promise.resolve();
    }

    get(key) {
        return Promise.resolve(this.data[key]);
    }

    remove(key) {
        delete this.data[key];
        return Promise.resolve();
    }
};
