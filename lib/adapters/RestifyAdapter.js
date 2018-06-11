'use strict';

const BaseAdapter = require('./BaseAdapter');

// http://restify.com/docs/request-api/#header
// http://restify.com/docs/response-api/#header

class RestifyAdapter extends BaseAdapter {
    setHeader(name, value) {
        this.res.removeHeader(name);
        this.res.header(name, value);
    }

    getHeader(name) {
        return this.req.header(name);
    }

    setUser(user) {
        this.req.user = user;
    }

    delUser() {
        delete this.req.user;
    }
}

module.exports = RestifyAdapter;
