'use strict';

const BaseTransport = require('./BaseTransport');

/**
 * Transport for passing the session ID information in a custom header.
 */
class HeaderTransport extends BaseTransport{
    /**
     * Create header transport.
     * @param {Object} adapter
     * @param {Object} config
     * @param {string} config.headerName
     */
    constructor(adapter, config) {
        super(adapter, config);
    }

    /**
     * Send session ID using adapter.
     * @param {string} sessionId
     */
    sendSessionId(sessionId) {
        this.adapter.setHeader(this.config.headerName, sessionId);
    }

    /**
     * Fetch session ID using adapter.
     * @returns {string}
     */
    receiveSessionId() {
        return this.adapter.getHeader(this.config.headerName);
    }
}

module.exports = HeaderTransport;
