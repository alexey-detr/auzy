'use strict';

// http://expressjs.com/en/api.html#req.get
// http://expressjs.com/en/api.html#res.set

class ExpressAdapter {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    setHeader(name, value) {
        this.res.set(name, value);
    }

    getHeader(name) {
        return this.req.get(name);
    }

    setUser(user) {
        this.req.user = user;
    }
}

module.exports = ExpressAdapter;
