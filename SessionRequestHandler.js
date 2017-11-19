'use strict';

const uuidv4 = require('uuid/v4');

module.exports = class SessionRequestHandler {
    /**
     * @param req
     * @param res
     * @param {Storage} storage
     * @param config
     */
    constructor(req, res, storage, config) {
        this.req = req;
        this.res = res;
        this.storage = storage;
        this.config = config;
        this.sessionId = null;
        this.sessionData = {};
    }

    saveSession() {
        if (this.config.sendSessionId) {
            this.config.sendSessionId(this.res, this.config.sessionName, this.sessionId);
        }
        return this.storage.set(this.sessionId, this.sessionData, this.config.ttl);
    }

    async loadSession() {
        if (this.config.receiveSessionId) {
            this.sessionId = this.config.receiveSessionId(this.req, this.config.sessionName);
        }
        if (!this.sessionId) {
            this.sessionId = this.config.generateSessionId || uuidv4();
        }
        this.sessionData = await this.storage.get(this.sessionId);
        if (this.config.loadUser && this.sessionData) {
            this.req.user = await this.config.loadUser(this.sessionData);
        } else if (this.config.loadUser) {
            this.req.user = null;
        }
        if (this.config.resave) {
            this.saveSession();
        }
    }

    async authenticate(sessionData) {
        this.sessionData = sessionData;
        if (this.config.loadUser) {
            this.req.user = await this.config.loadUser(this.sessionData);
        }
        return this.saveSession();
    }

    destroy() {
        if (!this.sessionId) {
            return Promise.resolve();
        }
        return this.storage.del(this.sessionId);
    }
};
