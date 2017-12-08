const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');
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
    framework: 'koa',
};

const server = new Koa();
server.use(koaBody());
server.use(auzy(auzyConfig, auzyEnvironment));

router.post('/login', async (ctx) => {
    const index = users.findIndex(user => user.name === ctx.request.body.name);
    if (index !== -1) {
        const user = users[index];
        await ctx.session.authenticate({userId: user.id});
        ctx.response.body = {name: ctx.state.user.name};
    }
});

router.get('/secret', async (ctx) => {
    if (ctx.state.user) {
        ctx.response.body = {email: ctx.state.user.email};
    } else {
        ctx.throw(403, 'Restricted area');
    }
});

router.post('/logout', async (ctx) => {
    ctx.status = 200;
    ctx.session.destroy();
});

server.use(router.routes());

const launchPromise = new Promise((resolve) => {
    const nodeServer = server.listen(9001, () => {
        resolve(nodeServer);
    });
});

module.exports = launchPromise;
