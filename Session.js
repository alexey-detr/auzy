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

    saveSession() {
        if (this.config.sendSessionId) {
            this.config.sendSessionId(res, this.config.sessionName, this.sessionId);
        }
        return this.storage.set(this.sessionId, this.sessionData, this.config.expire);
    }

    async loadSession(req) {
        this.sessionId = req.getHeader(this.config.sessionName);
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

    // sendSessionId(res, sessionName, sessionId) {
    //     this.res.setHeader(this.config.sessionName, this.sessionId);
    // }
    //
    // loadUser(sessionData) {
    //
    // }

    generateSessionId() {
        return this.sessionId;
    }

    authenticate(sessionData) {
        this.sessionData = sessionData;
        this.saveSession();
    }

    destroy() {
        return this.storage.del(this.sessionId);
    }
};
