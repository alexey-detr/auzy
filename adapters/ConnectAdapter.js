'use strict';

const BaseAdapter = require('./DefaultAdapter');

// https://nodejs.org/api/http.html#http_request_getheader_name
// https://nodejs.org/api/http.html#http_response_setheader_name_value

class ConnectAdapter extends BaseAdapter {
    setHeader(name, value) {
        this.res.setHeader(name, value);
    }

    getHeader(name) {
        return this.req.headers[name.toLowerCase()];
    }

    setUser(user) {
        this.req.user = user;
    }
}

module.exports = ConnectAdapter;
