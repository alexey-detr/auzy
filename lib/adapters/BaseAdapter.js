'use strict';

class BaseAdapter {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    setHeader() {
        throw new Error('This method has to be implemented.');
    }

    getHeader() {
        throw new Error('This method has to be implemented.');
    }

    setUser() {
        throw new Error('This method has to be implemented.');
    }
}

module.exports = BaseAdapter;
