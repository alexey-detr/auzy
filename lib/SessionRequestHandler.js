'use strict';

const crypto = require('crypto');

/**
 * Core class with session handling logic.
 */
class SessionRequestHandler {
    /**
     * Create a session request handler object.
     * @param {Object} req
     * @param {Object} res
     * @param {ObjectStorage} storage
     * @param {Object} adapter
     * @param {Object} config
     */
    constructor(req, res, storage, adapter, config) {
        this.req = req;
        this.res = res;
        this.storage = storage;
        this.config = config || {};
        this.sessionData = {};
        this.adapter = adapter;
    }

    /**
     * Save session into the storage.
     * @returns {Promise<void>}
     */
    saveSession() {
        return this.storage.set(this.sessionId, this.sessionData, this.config.ttl);
    }

    /**
     * Put a session ID into the response object directly or using an adapter.
     */
    sendSession() {
        if (this.config.sendSessionId) {
            const proxy = this.adapter || this.res;
            this.config.sendSessionId(proxy, this.config.sessionName, this.sessionId);
        }
    }

    /**
     * Fetch a session ID from the request object and load its data
     * from the storage.
     * @returns {Promise<void>}
     */
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

    /**
     * Load a user using the session data.
     * @returns {Promise<void>}
     */
    async handleUser() {
        if (this.config.loadUser && this.sessionData) {
            const user = await this.config.loadUser(this.sessionData);
            this.setUserIntoRequestOrAdapter(user);
        } else if (this.config.loadUser) {
            this.setUserIntoRequestOrAdapter(null);
        }
    }

    /**
     * Put a user into the request object directly or via an adapter.
     * @param {Object} user
     */
    setUserIntoRequestOrAdapter(user) {
        if (this.adapter) {
            this.adapter.setUser(user);
        } else {
            this.req.user = user;
        }
    }

    /**
     * Save the new session data to the storage. Also user will be loaded into
     * the the request object directly or using an adapter.
     * @param sessionData
     * @returns {Promise<void>}
     */
    async authenticate(sessionData) {
        this.sessionData = sessionData;
        await this.handleUser();
        if (!this.config.alwaysSend) {
            this.sendSession();
        }
        return this.saveSession();
    }

    /**
     * Destroy the session data from the storage and removes user from the
     * request object directly or using an adapter.
     * @returns {Promise<void>}
     */
    destroy() {
        this.sessionData = {};
        // TODO put this logic into an adapter if adapter is specified
        delete this.req.user;
        if (!this.sessionId) {
            return Promise.resolve();
        }
        const sessionId = this.sessionId;
        delete this.sessionId;
        return this.storage.del(sessionId);
    }

    /**
     * Generate strong sequence of bytes to use it as new session ID.
     * @returns {string}
     */
    static generateSessionId() {
        return crypto.randomBytes(20).toString('base64');
    }
}

module.exports = SessionRequestHandler;
