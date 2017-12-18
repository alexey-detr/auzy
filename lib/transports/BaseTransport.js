'use strict';

/**
 * Base class for transports.
 */
class BaseTransport {
    /**
     * Create transport.
     * @param {Object} adapter
     * @param {Object} config
     */
    constructor(adapter, config) {
        this.adapter = adapter;
        this.config = config;
    }

    /**
     * Send session ID using adapter.
     * @param {string} sessionId
     */
    sendSessionId(sessionId) {
        throw new Error('This method has to be implemented.');
    }

    /**
     * Fetch session ID using adapter.
     * @returns {string}
     */
    receiveSessionId() {
        throw new Error('This method has to be implemented.');
    }
}

module.exports = BaseTransport;
