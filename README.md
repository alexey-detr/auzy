# auzy

[![Build Status](https://travis-ci.org/alexey-detr/auzy.svg?branch=master)](https://travis-ci.org/alexey-detr/auzy) [![Maintainability](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/maintainability)](https://codeclimate.com/github/alexey-detr/auzy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/test_coverage)](https://codeclimate.com/github/alexey-detr/auzy/test_coverage)

Don't ever get confused when adding session middleware into your project!

## Project features

- Modern ES6 syntax
- Promise and async/await ready
- Compatible with many middleware based frameworks (e.g. Express, Restify)
- Flexible to use any session storage (e.g. Redis, MongoDB)
- Well documented (README is almost done, JSDoc is in progress)
- Covered with unit tests
- Covered with functional tests for [Restify](http://restify.com/), [Express](http://expressjs.com/), [koa.js](http://koajs.com/), [Connect](https://github.com/senchalabs/connect)
- Made as simple as possible

It's all about **auzy**. The Node.js middleware library made to add sessions support.

**The project is not production ready, please be careful using it.**

## Examples

For usage with specific framework see the [examples directory](https://github.com/alexey-detr/auzy/tree/master/examples).

## Quick start

Install auzy and session storage (Redis in this example)

```bash
npm install --save auzy auzy-storage-redis
# or
yarn add auzy auzy-storage-redis
```

Add the middleware into your project

```js
const auzyConfig = {
    session: {
        // Session name will appear as request and response header name below.
        sessionName: 'X-Session-Token',

        // TTL is the session expiration time in milliseconds.
        ttl: 60 * 60 * 24 * 30 * 6 * 1000,

        // Contains logic to fetch session ID from request object.
        // String with session ID must be returned.
        receiveSessionId: (req, sessionName) => req.header(sessionName),

        // Contains logic to send session ID to client via response object.
        sendSessionId: (res, sessionName, sessionId) => res.header(sessionName, sessionId),

        // Contains logic to fetch user data from database.
        // Promise is expected as return value, it should resolve user data.
        // Resolved user data will be set as req.user for current request.
        loadUser: (sessionData) => {
            const query = {_id: new ObjectId(sessionData.userId)};
            return User.Model.findOne().exec();
        }
    },
};
const auzyEnvironment = {storage: 'redis'};
app.use(auzy(auzyConfig, auzyEnvironment));
```

### Login

Use session object inside your login route

```js
async (req, res, next) => {
    const reqUser = req.body.user;
    const dbQuery = {
        email: reqUser.email,
    };
    const user = await User.Model.findOne(dbQuery).exec();
    if (!user) {
        return next();
    }
    await user.validPassword(reqUser.password);
    await req.session.authenticate({userId: String(user._id)});
    res.send({user: req.user.name});
}
```

### Logout

To logout and destroy current session you have to call `destroy()` method

```js
async (req, res, next) => {
    const user = req.user;
    if (user) {
        await req.session.destroy();
    }
    res.send({user: null});
}
```

## Configuration

There are two things you can specify in the configuration:

- Session handler configuration
- Environment hints

### Session handler

Session handler is a core of auzy project, which has configuration options described in this section

#### `function receiveSessionId(adapter, sessionName): string`

The method describes how the sessionId will be fetched from the request.

#### `function sendSessionId(adapter, sessionName, sessionId)`

The method describes how the sessionId will be put into the response.

#### `sessionName: string`

Property specifies the session name, which will be passed to `receiveSessionId` or `sendSessionId` methods.

#### `function loadUser(sessionData): Promise`

The method describes how user will be loaded using `sessionData`. User object itself can be stored into your main application database, e.g. MongoDB. The returned promise should resolve user object fetched from DB. Fetched user will be stored in the request object (or something similar so you will be able to access it in any controller).

#### `function generateSessionId(): string`

The method describes how the new session ID will be generated. If not specified, the session ID will be Base64 encoded 20 bytes length cryptographically strong pseudo-random data. To generate it auzy uses node's module [crypto](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback).

#### `ttl: string`

Property specifies how long the session data will be valid until expiration. **Value must be specified in milliseconds.**

#### `alwaysSave: boolean`

If `true` the session data will be saved every time the session is loaded. Can be useful to resave the new user name if it is stored in the session data.

#### `alwaysSend: string`

If `true` the session ID will be send to client in the every response. If `false` the session ID will be send only when `session.authenticate()` is explicitly called.

### Environment hints

Environment hints help auzy understand which kind of storage it should use or which framework context it is going to work in.
So hint can describe framework or storage.

#### `framework: string`

Just a framework code. Following frameworks are supported for now:

- `restify` — [Restify](http://restify.com/)
- `express` — [Express](http://expressjs.com/)
- `koa` — [koa.js](http://koajs.com/)
- `connect` — [Connect](https://github.com/senchalabs/connect)

If the framework hint is specified, `receiveSessionId` and `sendSessionId` will get in their first argument adapter object, which actually just a unified way to modify request or response object for hinted framework.

#### `storage: string`

Storage hint specifies which kind of storage will be used to store session data. Following storages are supported now:

- `redis` — Redis [alexey-detr/auzy-storage-redis](https://github.com/alexey-detr/auzy-storage-redis)

If not specified a native JS object storage will be used. It is non-persistent so any saved session data will be destroyed whenever the server will be restarted.

## TODOs and ideas

- [ ] Allow to store any data in the session, not just authorization data.
- [ ] Various transports or ways to get / pass session IDs from / to client (header, cookie, body?)
- [ ] Authenticators support to validate credentials (e.g. email password pairs, any kind of tokens) with hashes or other verifiers. In other words it will provide easy to use Facebook login for example.
