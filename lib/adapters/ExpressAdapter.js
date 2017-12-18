'use strict';

const BaseAdapter = require('./BaseAdapter');

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

    delUser() {
        delete this.req.user;
    }
}

module.exports = ExpressAdapter;
