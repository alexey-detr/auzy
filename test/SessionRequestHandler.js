const chai = require('chai');
const expect = chai.expect;

const SessionRequestHandler = require('../SessionRequestHandler');

describe('SessionRequestHandler', () => {
    describe('constructor', () => {
        it('should accept req', function() {
            const sessionHandler = new SessionRequestHandler({body: {}});
            expect(sessionHandler.req).to.have.property('body');
        });
    });
});

