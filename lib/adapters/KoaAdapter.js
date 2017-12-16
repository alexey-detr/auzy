'use strict';

// http://koajs.com/#request
// http://koajs.com/#response

class KoaAdapter {
    constructor(ctx) {
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
}

module.exports = KoaAdapter;
