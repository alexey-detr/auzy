const restify = require('restify');
const auzy = require('../index');

const users = [{
    id: 1,
    name: 'Bob',
    email: 'bob@mail.com',
}];

const auzyConfig = {
    session: {
        sessionName: 'X-Session-Token',
        // ttl: 60 * 60 * 24 * 30 * 6,
        alwaysSend: true,
        receiveSessionId: (req, sessionName) => req.header(sessionName),
        sendSessionId: (res, sessionName, sessionId) => res.header(sessionName, sessionId),
        loadUser: (sessionData) => {
            const index = users.findIndex(user => user.id === sessionData.userId);
            if (index === -1) {
                return null;
            }
            return users[index];
        },
    },
};
const auzyEnvironment = {
    framework: 'restify',
};

const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(auzy(auzyConfig, auzyEnvironment));

server.post('/login', async (req, res, next) => {
    const index = users.findIndex(user => user.name === req.body.name);
    if (index !== -1) {
        const user = users[index];
        await req.session.authenticate({userId: user.id});
        res.send({name: req.user.name});
    } else {
        res.send(404, {error: 'User not found'});
    }
    next();
});

server.get('/secret', (req, res, next) => {
    if (req.user) {
        res.send({email: req.user.email});
    } else {
        res.send(403, {error: 'Restricted area'});
    }
    next();
});

server.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.send(200);
    next();
});

const launchPromise = new Promise((resolve) => {
    server.listen(9001, () => {
        resolve(server);
    });
});

module.exports = launchPromise;
