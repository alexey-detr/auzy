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
        ttl: 60 * 60 * 24 * 30 * 6,
        alwaysSend: true,
        receiveSessionId: (proxy, sessionName) => proxy.getHeader(sessionName),
        sendSessionId: (proxy, sessionName, sessionId) => proxy.setHeader(sessionName, sessionId),
        loadUser: (sessionData) => {
            const index = users.findIndex(user => user.id === sessionData.userId);
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
