'use strict';

class Item {
    constructor(value, ttl) {
        this.value = value;
        if (ttl) {
            this.ttl = ttl;
            this.createdAt = Date.now();
        }
    }

    isExpired() {
        if (!this.ttl && this.ttl !== 0) {
            return false;
        }
        return Date.now() > this.createdAt + this.ttl;
    }
}

class ObjectStorage {
    constructor() {
        this.data = {};
    }

    set(key, value, ttl = null) {
        this.data[key] = new Item(value, ttl);
        return Promise.resolve();
    }

    get(key) {
        const item = this.data[key];
        if (item && item.isExpired()) {
            this.del(key);
            return Promise.resolve();
        }
        const value = item ? item.value : undefined;
        return Promise.resolve(value);
    }

    del(key) {
        delete this.data[key];
        return Promise.resolve();
    }
}

module.exports = ObjectStorage;
