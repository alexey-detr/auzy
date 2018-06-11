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
     * @param {BaseAdapter} adapter
     * @param {BaseTransport} transport
     * @param {Object} config
     */
    constructor(req, res, storage, adapter, transport, config) {
        this.req = req;
        this.res = res;
        this.storage = storage;
        this.config = config || {};
        this.sessionData = {};
        this.adapter = adapter;
        this.transport = transport;
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
            const adapter = this.adapter || this.res;
            this.config.sendSessionId(adapter, this.config.sessionName, this.sessionId);
        }
        if (!this.config.sendSessionId && this.transport) {
            this.transport.sendSessionId(this.sessionId);
        }
    }

    /**
     * Fetch a session ID from the request object and load its data
     * from the storage.
     * @returns {Promise<void>}
     */
    async loadSession() {
        if (this.config.receiveSessionId) {
            const adapter = this.adapter || this.req;
            this.sessionId = this.config.receiveSessionId(adapter, this.config.sessionName);
        }
        if (!this.config.receiveSessionId && this.transport) {
            this.sessionId = this.transport.receiveSessionId();
        }
        if (!this.sessionId) {
            this.generateNewId();
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
     * the request object directly or using an adapter. This method forces session ID
     * regeneration to eliminate possible situations when client passes ID that doesn't match
     * the format provided by `generateSessionId`.
     * @param sessionData
     * @returns {Promise<void>}
     */
    async authenticate(sessionData) {
        this.generateNewId();
        this.sessionData = sessionData;
        await this.handleUser();
        this.sendSession();

        return this.saveSession();
    }

    /**
     * Destroy the session data from the storage and removes user from the
     * request object directly or using an adapter.
     * @returns {Promise<void>}
     */
    destroy() {
        this.sessionData = {};
        if (this.adapter) {
            this.adapter.delUser();
        } else {
            // TODO move this into configuration because custom framework can have different API
            delete this.req.user;
        }
        if (!this.sessionId) {
            return Promise.resolve();
        }
        const sessionId = this.sessionId;
        delete this.sessionId;
        return this.storage.del(sessionId);
    }

    /**
     * Generates a new session ID taking into account handler's config.
     */
    generateNewId() {
        const generateSessionId = this.config.generateSessionId;
        this.sessionId = generateSessionId ? generateSessionId() : SessionRequestHandler.generateSessionId();
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
