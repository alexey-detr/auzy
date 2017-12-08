const connect = require('connect');
const bodyParser = require('body-parser');
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
        receiveSessionId: (proxy, sessionName) => proxy.getHeader(sessionName),
        sendSessionId: (proxy, sessionName, sessionId) => proxy.setHeader(sessionName, sessionId),
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
    framework: 'connect',
};

const server = connect();
server.use(bodyParser.json());
server.use(auzy(auzyConfig, auzyEnvironment));

server.use('/login', async (req, res) => {
    const index = users.findIndex(user => user.name === req.body.name);
    if (index !== -1) {
        const user = users[index];
        await req.session.authenticate({userId: user.id});
        res.end(JSON.stringify({name: req.user.name}));
    }
});

server.use('/secret', (req, res) => {
    if (req.user) {
        res.end(JSON.stringify({email: req.user.email}));
    } else {
        res.statusCode = 403;
        res.end(JSON.stringify({error: 'Restricted area'}));
    }
});

server.use('/logout', (req, res) => {
    req.session.destroy();
    res.end();
});

const launchPromise = new Promise((resolve) => {
    const nodeServer = server.listen(9001, () => {
        resolve(nodeServer);
    });
});

module.exports = launchPromise;
