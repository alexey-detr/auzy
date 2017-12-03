# auzy

[![Build Status](https://travis-ci.org/alexey-detr/auzy.svg?branch=master)](https://travis-ci.org/alexey-detr/auzy) [![Maintainability](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/maintainability)](https://codeclimate.com/github/alexey-detr/auzy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/test_coverage)](https://codeclimate.com/github/alexey-detr/auzy/test_coverage)

Don't ever get confused when adding session middleware into your project!

## Project features

- Modern ES6 syntax
- Promise and async/await ready
- Compatible with any middleware based framework (e.g. Express, Restify)
- Flexibility for using any session storage (e.g. Redis, MongoDB)
- Well documented (WIP)
- Covered with unit-test (WIP)
- As simple as possible

It's all about **auzy**. The Node.js middleware library made to add sessions support.

**The project is not production ready, please be careful using it.**

## Available storages

- Redis [alexey-detr/auzy-storage-redis](https://github.com/alexey-detr/auzy-storage-redis)

## Examples

For usage with specific framework see [examples directory](https://github.com/alexey-detr/auzy/tree/master/examples).

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

        // TTL is the session expiration time in seconds.
        ttl: 60 * 60 * 24 * 30 * 6,

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
app.use(auzy(auzyConfig, 'redis'));
```

### Login

Use session inside your login route

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

To logout and destroy current session you just have to call `destroy()` method

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

There two things in auzy you can to configure:

- Storage
- Session handler

To configure a storage you should see the storage repository you are using.
This repo is responsible for session configuration.

- `receiveSessionId`: function → string
- `sendSessionId`: function
- `sessionName`: string
- `loadUser`: function → promise(object)
- `generateSessionId`: function → string
- `TTL`: number
- `alwaysSave`: boolean
- `alwaysSend`: boolean

## TODOs and ideas

- [ ] Framework adapters for setting and getting headers ([Restify](http://restify.com/), [Express](http://expressjs.com/), [koa.js](http://koajs.com/), [Locomotive](http://www.locomotivejs.org))
- [ ] Various transports or ways to get / pass session IDs from / to client (header, cookie, body?)
- [ ] Authenticators support to validate credentials (e.g. email password pairs, any kind of tokens) with hashes or other verifiers. In other words it will provide easy to use Facebook login for example.
