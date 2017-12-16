'use strict';

const BaseAdapter = require('./DefaultAdapter');

// http://restify.com/docs/request-api/#header
// http://restify.com/docs/response-api/#header

class RestifyAdapter extends BaseAdapter {
    setHeader(name, value) {
        this.res.header(name, value);
    }

    getHeader(name) {
        return this.req.header(name);
    }

    setUser(user) {
        this.req.user = user;
    }
}

module.exports = RestifyAdapter;
