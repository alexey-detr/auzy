'use strict';

const BaseAdapter = require('./DefaultAdapter');

// http://expressjs.com/en/api.html#req.get
// http://expressjs.com/en/api.html#res.set

class ExpressAdapter extends BaseAdapter {
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
