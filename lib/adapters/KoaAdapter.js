'use strict';

const BaseAdapter = require('./BaseAdapter');

// http://koajs.com/#request
// http://koajs.com/#response

class KoaAdapter extends BaseAdapter {
    constructor(ctx) {
        super();
        this.ctx = ctx;
    }

    setHeader(name, value) {
        this.ctx.set(name, value);
    }

    getHeader(name) {
        return this.ctx.get(name);
    }

    setUser(user) {
        this.ctx.state.user = user;
    }

    delUser() {
        delete this.ctx.state.user;
    }
}

module.exports = KoaAdapter;
