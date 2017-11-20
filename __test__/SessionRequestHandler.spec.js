const chai = require('chai');
const expect = chai.expect;

const SessionRequestHandler = require('../SessionRequestHandler');

describe('SessionRequestHandler', () => {
    describe('initialization', () => {
        it('should accept req', () => {
            const sessionHandler = new SessionRequestHandler({body: {}});
            expect(sessionHandler.req).to.have.property('body');
        });

        it('should accept res', () => {
            const sessionHandler = new SessionRequestHandler(null, {headers: {}});
            expect(sessionHandler.res).to.have.property('headers');
        });

        it('should accept storage object', () => {
            const sessionHandler = new SessionRequestHandler(null, null, {set: () => true});
            expect(sessionHandler.storage).to.have.property('set');
        });

        it('should accept config', () => {
            const sessionHandler = new SessionRequestHandler(null, null, null, {prop: true});
            expect(sessionHandler.config.prop).to.equal(true);
        });

        it('should init sessionId as null', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(sessionHandler.sessionId).to.equal(null);
        });

        it('should init sessionData as empty object', () => {
            const sessionHandler = new SessionRequestHandler();
            expect(sessionHandler.sessionData).to.be.empty;
            expect(sessionHandler.sessionData).instanceof(Object);
        });
    });
});

