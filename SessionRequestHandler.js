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
        this.config = config || {};
        this.sessionData = {};
    }

    saveSession() {
        return this.storage.set(this.sessionId, this.sessionData, this.config.ttl);
    }

    sendSession() {
        if (this.config.sendSessionId) {
            this.config.sendSessionId(this.res, this.config.sessionName, this.sessionId);
        }
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
        if (this.config.alwaysSave) {
            this.saveSession();
        }
        if (this.config.alwaysSend) {
            this.sendSession();
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
        this.sessionData = {};
        if (!this.sessionId) {
            return Promise.resolve();
        }
        const sessionId = this.sessionId;
        delete this.sessionId;
        return this.storage.del(sessionId);
    }
};
