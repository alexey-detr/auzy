'use strict';

const SessionRequestHandler = require('../SessionRequestHandler');
const StorageStub = require('./stubs/StorageStub');
const getSessionWithStorage = (storage, config) => {
    const req = {
        getHeader() {
            return 'long-session-id';
        },
    };
    const res = {
        setHeader() {
        },
    };
    return new SessionRequestHandler(req, res, storage, config);
};

describe('SessionRequestHandler', () => {
    describe('initialization', () => {
        it('should accept req', () => {
            const sessionHandler = new SessionRequestHandler({body: {}});
            expect(sessionHandler.req).toHaveProperty('body');
        });

        it('should accept res', () => {
            const sessionHandler = new SessionRequestHandler(null, {headers: {}});
            expect(sessionHandler.res).toHaveProperty('headers');
        });

        it('should accept storage object', () => {
            const sessionHandler = new SessionRequestHandler(null, null, {set: () => true});
            expect(sessionHandler.storage).toHaveProperty('set');
        });

        it('should accept config', () => {
            const sessionHandler = new SessionRequestHandler(null, null, null, {prop: true});
            expect(sessionHandler.config.prop).toEqual(true);
        });

        it('should init sessionId as null', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(sessionHandler.sessionId).toEqual(null);
        });

        it('should init sessionData as empty object', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(sessionHandler.sessionData).toMatchObject({});
            expect(sessionHandler.sessionData).toBeInstanceOf(Object);
        });

        describe('configuration', () => {
            it('should accept sessionName', () => {
                const sessionHandler = new SessionRequestHandler(null, null, null, {sessionName: 'session-name'});
                expect(sessionHandler.config.sessionName).toEqual('session-name');
            });
        });
    });

    describe('loading session', () => {
        it('should receive sessionId from request if receiveSessionId function specified', async () => {
            const storage = new StorageStub();
            storage.get = jest.fn();
            const sessionHandler = getSessionWithStorage(storage, {
                sessionName: 'X-Session',
                receiveSessionId: (req, sessionName) => req.getHeader(sessionName),
            });
            await sessionHandler.loadSession();
            expect(storage.get).toHaveBeenCalledTimes(1);
            expect(storage.get).toHaveBeenCalledWith('long-session-id');
            expect(sessionHandler.sessionId).toEqual('long-session-id');
        });

        it('should send sessionId to client in response if sendSessionId function specified', async () => {
            const storage = new StorageStub();
            const sessionHandler = getSessionWithStorage(storage, {
                sessionName: 'X-Session',
                receiveSessionId: (req, sessionName) => req.getHeader(sessionName),
                sendSessionId: (res, sessionName, sessionId) => res.setHeader(sessionName, sessionId),
            });
            sessionHandler.config.sendSessionId = jest.fn();
            await sessionHandler.loadSession();
            sessionHandler.sendSession();

            const sendSessionId = sessionHandler.config.sendSessionId;
            expect(sendSessionId).toHaveBeenCalledTimes(1);
            expect(sendSessionId).toHaveBeenCalledWith(expect.anything(), 'X-Session', 'long-session-id');
        });
    });
});
