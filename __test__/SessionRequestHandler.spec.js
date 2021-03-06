'use strict';

const SessionRequestHandler = require('../lib/SessionRequestHandler');
const StorageMock = require('./mocks/StorageMock');
const getSessionWithStorage = (storage, config) => {
    const req = {
        getHeader() {
        },
    };
    const res = {
        setHeader() {
        },
    };
    const adapter = {
        getHeader() {
            return 'long-session-id';
        },
        setHeader() {
        },
        setUser() {
        },
        delUser() {
        },
    };
    const transport = {
        sendSessionId() {
        },
        receiveSessionId() {
            return 'long-session-id';
        },
    };
    storage = storage || new StorageMock();
    return new SessionRequestHandler(req, res, storage, adapter, transport, config);
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

        it('should accept adapter object', () => {
            const sessionHandler = new SessionRequestHandler(null, null, null, {setHeader: () => true});
            expect(sessionHandler.adapter).toHaveProperty('setHeader');
        });

        it('should accept transport object', () => {
            const sessionHandler = new SessionRequestHandler(null, null, null, null, {sendSessionId: () => true});
            expect(sessionHandler.transport).toHaveProperty('sendSessionId');
        });

        it('should accept config', () => {
            const sessionHandler = new SessionRequestHandler(null, null, null, null, null, {prop: true});
            expect(sessionHandler.config.prop).toEqual(true);
        });

        it('should init sessionId as undefined value', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(sessionHandler.sessionId).toBeUndefined();
        });

        it('should init sessionData as empty object', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(Object.keys(sessionHandler.sessionData)).toHaveLength(0);
            expect(sessionHandler.sessionData).toBeInstanceOf(Object);
        });

        it('should init config as empty object if not specified', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(Object.keys(sessionHandler.config)).toHaveLength(0);
            expect(sessionHandler.config).toBeInstanceOf(Object);
        });

        describe('configuration', () => {
            it('should accept sessionName', () => {
                const sessionHandler = new SessionRequestHandler(null, null, null, null, null, {sessionName: 'session-name'});
                expect(sessionHandler.config.sessionName).toEqual('session-name');
            });
        });
    });

    describe('load session', () => {
        it('should receive sessionId from request if receiveSessionId function specified', async () => {
            const storage = new StorageMock();
            storage.get = jest.fn();
            const sessionHandler = getSessionWithStorage(storage, {
                receiveSessionId: (req, sessionName) => req.getHeader(sessionName),
            });
            await sessionHandler.loadSession();
            expect(storage.get).toHaveBeenCalledTimes(1);
            expect(storage.get).toHaveBeenCalledWith('long-session-id');
            expect(sessionHandler.sessionId).toEqual('long-session-id');
        });

        it('should send sessionId to client in response if sendSessionId function specified', async () => {
            const storage = new StorageMock();
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

        it('should generate new session ID if it wasn\'t received in the request', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage, {
                sessionName: 'X-Session',
                receiveSessionId: () => {
                },
            });
            expect(sessionHandler.sessionId).toBeUndefined();
            await sessionHandler.loadSession();
            expect(sessionHandler.sessionId).toMatch(/[a-z0-9\-]+/);
        });

        it('should use custom session ID generator function if it is specified in config', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage, {
                sessionName: 'X-Session',
                generateSessionId: () => 'session_1',
                receiveSessionId: () => {
                },
            });
            expect(sessionHandler.sessionId).toBeUndefined();
            await sessionHandler.loadSession();
            expect(sessionHandler.sessionId).toEqual('session_1');
        });

        it('should send session ID in response if alwaysSend config is set to true', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage, {
                alwaysSend: true,
            });
            sessionHandler.sendSession = jest.fn();
            await sessionHandler.loadSession();

            expect(sessionHandler.sendSession).toHaveBeenCalledTimes(1);
        });

        it('should save session if alwaysSave config is set to true', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage, {
                alwaysSave: true,
            });
            sessionHandler.saveSession = jest.fn();
            await sessionHandler.loadSession();

            expect(sessionHandler.saveSession).toHaveBeenCalledTimes(1);
        });

        it('should call adapter\'s setUser method if loadUser function is set in config', async () => {
            const storage = new StorageMock();
            storage.get = jest.fn().mockImplementation(() => ({userId: 123}));
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.config.loadUser = jest.fn().mockImplementation(() => Promise.resolve({id: 123}));
            sessionHandler.adapter.setUser = jest.fn();
            await sessionHandler.loadSession();

            expect(sessionHandler.config.loadUser).toHaveBeenCalledTimes(1);
            expect(sessionHandler.adapter.setUser).toHaveBeenCalledTimes(1);
            expect(sessionHandler.adapter.setUser).toHaveBeenCalledWith({id: 123});
        });

        it('should call adapter\'s setUser method if loadUser function is set in config but there is no session data in storage', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.config.loadUser = jest.fn().mockImplementation(() => Promise.resolve({id: 123}));
            sessionHandler.adapter.setUser = jest.fn();
            await sessionHandler.loadSession();

            expect(sessionHandler.adapter.setUser).toHaveBeenCalledTimes(1);
            expect(sessionHandler.adapter.setUser).toHaveBeenCalledWith(null);
        });
    });

    describe('authenticate', () => {
        it('should accept sessionData', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            await sessionHandler.authenticate({a: 1});

            expect(sessionHandler.sessionData).toHaveProperty('a');
        });

        it('should call saveSession', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.saveSession = jest.fn();
            await sessionHandler.authenticate({});

            expect(sessionHandler.saveSession).toHaveBeenCalledTimes(1);
        });

        it('should call sendSession', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.sendSession = jest.fn();
            await sessionHandler.authenticate({});

            expect(sessionHandler.sendSession).toHaveBeenCalledTimes(1);
        });

        it('should call adapter\'s setUser method if loadUser function is set in config', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.config.loadUser = jest.fn().mockImplementation(() => Promise.resolve({id: 123}));
            sessionHandler.adapter.setUser = jest.fn();
            await sessionHandler.authenticate({});

            expect(sessionHandler.config.loadUser).toHaveBeenCalledTimes(1);
            expect(sessionHandler.adapter.setUser).toHaveBeenCalledTimes(1);
            expect(sessionHandler.adapter.setUser).toHaveBeenCalledWith({id: 123});
            await expect(sessionHandler.config.loadUser()).resolves.toMatchObject({id: 123});
        });

        it('should generate a new session ID with at least 10 bytes length', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.sessionId = 'abc';

            await sessionHandler.authenticate({});
            expect(sessionHandler.sessionId).toMatch(/^[a-zA-Z0-9+=/]{10,}$/);
        })
    });

    describe('destroy', () => {
        it('should call del storage method with sessionId argument', async () => {
            const storage = new StorageMock();
            storage.del = jest.fn();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.sessionId = '123abc';

            await sessionHandler.destroy();
            expect(storage.del).toHaveBeenCalledTimes(1);
            expect(storage.del).toHaveBeenCalledWith('123abc');
        });

        it('should set sessionData as empty object', async () => {
            const storage = new StorageMock();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.sessionData = {a: 1};

            await sessionHandler.destroy();
            expect(Object.keys(sessionHandler.sessionData)).toHaveLength(0);
            expect(sessionHandler.sessionData).toBeInstanceOf(Object);
        });

        it('should delete sessionId from session', async () => {
            const sessionHandler = getSessionWithStorage();
            sessionHandler.sessionId = '123abc';

            await sessionHandler.destroy();
            expect(sessionHandler.sessionId).toBeUndefined();
        });

        it('should call adapter\'s delUser method', async () => {
            const sessionHandler = getSessionWithStorage();
            sessionHandler.adapter.delUser = jest.fn();

            await sessionHandler.destroy();
            expect(sessionHandler.adapter.delUser).toHaveBeenCalledTimes(1);
        });

        it('should not call del storage method if sessionId is undefined', async () => {
            const storage = new StorageMock();
            storage.del = jest.fn();
            const sessionHandler = getSessionWithStorage(storage);
            sessionHandler.sessionId = undefined;

            await sessionHandler.destroy();
            expect(storage.del).toHaveBeenCalledTimes(0);
        });
    });
});
