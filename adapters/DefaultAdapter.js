'use strict';

class DefaultAdapter {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
}

module.exports = DefaultAdapter;
