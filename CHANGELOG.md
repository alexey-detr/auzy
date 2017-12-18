# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.0.0"></a>
# [3.0.0](https://github.com/alexey-detr/auzy/compare/v2.1.0...v3.0.0) (2017-12-18)


### Bug Fixes

* fixed issue when user was not deleted from session in Koa ([ed1117e](https://github.com/alexey-detr/auzy/commit/ed1117e))


### Features

* **ObjectStorage:** Added TTL support for a native ObjectStorage ([44da244](https://github.com/alexey-detr/auzy/commit/44da244))
* added header transport implementation ([d93d5d7](https://github.com/alexey-detr/auzy/commit/d93d5d7))


### BREAKING CHANGES

* **ObjectStorage:** TTL has to be specified in milliseconds now



<a name="2.1.0"></a>
# [2.1.0](https://github.com/alexey-detr/auzy/compare/v2.0.0...v2.1.0) (2017-12-08)


### Features

* Added first adapters implementation ([29439a0](https://github.com/alexey-detr/auzy/commit/29439a0))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/alexey-detr/auzy/compare/v2.0.0...v2.0.1) (2017-12-08)


### Features

* Added first adapters implementation ([29439a0](https://github.com/alexey-detr/auzy/commit/29439a0))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alexey-detr/auzy/compare/v1.0.2...v2.0.0) (2017-12-03)


### Tests

* First functional tests for Restify framework ([8d6c778](https://github.com/alexey-detr/auzy/commit/8d6c778))


### BREAKING CHANGES

* Middleware's second parameter is an object now, it contains definition of storage,
framework, etc.



<a name="1.0.2"></a>
## [1.0.2](https://github.com/alexey-detr/auzy/compare/v1.0.1...v1.0.2) (2017-11-20)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/alexey-detr/auzy/compare/e90b869...v1.0.1) (2017-11-19)


### Code Refactoring

* Now req and res are captured for every request ([c229dba](https://github.com/alexey-detr/auzy/commit/c229dba))


### Features

* Now it is possible to specify receiveSessionId in config ([e90b869](https://github.com/alexey-detr/auzy/commit/e90b869))


### BREAKING CHANGES

* API was broken
