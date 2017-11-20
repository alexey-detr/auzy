'use strict';

module.exports = class StorageStub {
    get(key) {
        return Promise.resolve();
    }

    set(key, value) {
        return Promise.resolve();
    }

    del(key) {
        return Promise.resolve();
    }
};
