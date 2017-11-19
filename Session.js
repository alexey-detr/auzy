'use strict';

module.exports = class Session {
    /**
     * @param {Storage} storage
     * @param config
     */
    constructor(storage, config) {
        this.storage = storage;
        this.config = config;
        this.sessionId = null;
        this.sessionData = {};
    }

    saveSession(res) {
        if (this.config.sendSessionId) {
            this.config.sendSessionId(res, this.config.sessionName, this.sessionId);
        }
        return this.storage.set(this.sessionId, this.sessionData, this.config.ttl);
    }

    async loadSession(req) {
        if (this.config.receiveSessionId) {
            this.sessionId = this.config.receiveSessionId(req, this.config.sessionName);
        }
        if (!this.sessionId) {
            this.sessionId = this.generateSessionId();
            this.saveSession();
        }
        this.sessionData = await this.storage.get(this.sessionId);
        if (this.config.loadUser && this.sessionData) {
            req.user = await this.config.loadUser(this.sessionData);
        } else if (this.config.loadUser) {
            req.user = null;
        }
    }

    generateSessionId() {
        return this.sessionId;
    }

    authenticate(res, sessionData) {
        this.sessionData = sessionData;
        return this.saveSession(res);
    }

    destroy() {
        return this.storage.del(this.sessionId);
    }
};
