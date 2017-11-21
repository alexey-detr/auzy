# auzy

[![Build Status](https://travis-ci.org/alexey-detr/auzy.svg?branch=master)](https://travis-ci.org/alexey-detr/auzy) [![Maintainability](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/maintainability)](https://codeclimate.com/github/alexey-detr/auzy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/test_coverage)](https://codeclimate.com/github/alexey-detr/auzy/test_coverage)

Don't ever be confused when adding session middleware into your project!

**auzy** is a Node.js middleware library to add sessions support into your web project.

## Project features

- Modern ES6 syntax
- Promise and async/await compatible
- Provide compatibility with any middleware based framework (e.g. Express, Restify)
- Flexibility for using any session storage (e.g. Redis, MongoDB)
- Well documented (not ready yet)
- Covered with unit-test (partially done)
- Be as simple as possible

## Available storages

- Redis [alexey-detr/auzy-storage-redis](https://github.com/alexey-detr/auzy-storage-redis)

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

        // TTL is specified in milliseconds and means the session expiration time.
        ttl: 60 * 60 * 24 * 30 * 6,

        // Contains logic to fetch session ID from request object.
        // Expected return value is string.
        receiveSessionId: (req, sessionName) => req.header(sessionName),

        // Contains logic to send session ID to client via response object.
        // There is no any value expected here.
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

Use middleware inside your login route

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
