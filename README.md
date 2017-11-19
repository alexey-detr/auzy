# auzy

[![Maintainability](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/maintainability)](https://codeclimate.com/github/alexey-detr/auzy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/dc7769e214a244cb68aa/test_coverage)](https://codeclimate.com/github/alexey-detr/auzy/test_coverage)

Don't ever be confused when adding authentication middleware into your project!

auzy is a Node.js middleware library to add sessions support into your web project.

auzy project was made to be simple. The reason why I started it is a complexity of alternative popular middleware. I follow next principles writing this project:

- Modern ES6 features
- Promise and async/await ready
- Be as simple as possible
- Compatibility with any middleware based framework (e.g. Express, Restify)
- Flexibility for adding any session backend storages (e.g. Redis, MongoDB)
- Covered with unit-test (not ready yet)

## Available torages

- Redis [alexey-detr/auzy-storage-redis](https://github.com/alexey-detr/auzy-storage-redis)
