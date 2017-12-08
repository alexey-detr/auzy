'use strict';

const crypto = require('crypto');

class SessionRequestHandler {
    /**
     * @param req
     * @param res
     * @param {Storage} storage
     * @param {Object} adapter
     * @param config
     */
    constructor(req, res, storage, adapter, config) {
        this.req = req;
        this.res = res;
        this.storage = storage;
        this.config = config || {};
        this.sessionData = {};
        this.adapter = adapter;
    }

    saveSession() {
        return this.storage.set(this.sessionId, this.sessionData, this.config.ttl);
    }

    sendSession() {
        if (this.config.sendSessionId) {
            const proxy = this.adapter || this.res;
            this.config.sendSessionId(proxy, this.config.sessionName, this.sessionId);
        }
    }

    async loadSession() {
        if (this.config.receiveSessionId) {
            const proxy = this.adapter || this.req;
            this.sessionId = this.config.receiveSessionId(proxy, this.config.sessionName);
        }
        if (!this.sessionId) {
            const generateSessionId = this.config.generateSessionId;
            this.sessionId = generateSessionId ? generateSessionId() : SessionRequestHandler.generateSessionId();
        }
        this.sessionData = await this.storage.get(this.sessionId);
        await this.handleUser();
        if (this.config.alwaysSave) {
            this.saveSession();
        }
        if (this.config.alwaysSend) {
            this.sendSession();
        }
    }

    async handleUser() {
        if (this.config.loadUser && this.sessionData) {
            const user = await this.config.loadUser(this.sessionData);
            if (this.adapter) {
                this.adapter.setUser(user);
            } else {
                this.req.user = user;
            }
        } else if (this.config.loadUser) {
            if (this.adapter) {
                this.adapter.setUser(null);
            } else {
                this.req.user = null;
            }
        }
    }

    async authenticate(sessionData) {
        this.sessionData = sessionData;
        await this.handleUser();
        if (!this.config.alwaysSend) {
            this.sendSession();
        }
        return this.saveSession();
    }

    destroy() {
        this.sessionData = {};
        delete this.req.user;
        if (!this.sessionId) {
            return Promise.resolve();
        }
        const sessionId = this.sessionId;
        delete this.sessionId;
        return this.storage.del(sessionId);
    }

    static generateSessionId() {
        return crypto.randomBytes(20).toString('base64');
    }
}

module.exports = SessionRequestHandler;
