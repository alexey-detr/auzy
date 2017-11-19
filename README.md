# auzy

[![Build Status](https://travis-ci.org/alexey-detr/auzy.svg?branch=master)](https://travis-ci.org/alexey-detr/auzy) [![Maintainability](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/maintainability)](https://codeclimate.com/github/alexey-detr/auzy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/test_coverage)](https://codeclimate.com/github/alexey-detr/auzy/test_coverage)

Don't ever be confused when adding authentication middleware into your project!

auzy is a Node.js middleware library to add sessions support into your web project.

auzy project was made to be simple. The reason why I started it is a complexity of alternative popular middleware. I follow next principles writing this project:

- Modern ES6 features
- Promise and async/await ready
- Be as simple as possible
- Compatibility with any middleware based framework (e.g. Express, Restify)
- Flexibility for adding any session backend storages (e.g. Redis, MongoDB)
- Well documented (not ready yet)
- Covered with unit-test (not ready yet)

## Available storages

- Redis [alexey-detr/auzy-storage-redis](https://github.com/alexey-detr/auzy-storage-redis)

## Quick start

Install auzy and session storage for it

```bash
npm install --save auzy auzy-storage-redis
# or
yarn add auzy auzy-storage-redis
```

Add middleware into your project

```js
const auzyConfig = {
    session: {
        sessionName: 'X-Session-Token',
        ttl: 60 * 60 * 24 * 30 * 6,
        receiveSessionId: (req, sessionName) => req.header(sessionName),
        sendSessionId: (res, sessionName, sessionId) => res.header(sessionName, sessionId),
        loadUser: (sessionData) => {
            return User.Model.findOne({_id: new ObjectId(sessionData.userId)}).exec();
        }
    },
};
app.use(auzy(auzyConfig, 'redis'));
```

### Login

Use middleware inside login route

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
