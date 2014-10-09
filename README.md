# inject-loader

[![Build Status](https://travis-ci.org/plasticine/inject-loader.svg?branch=master)](https://travis-ci.org/plasticine/inject-loader) [![Dependency Status](https://gemnasium.com/plasticine/inject-loader.svg)](https://gemnasium.com/plasticine/inject-loader) [![NPM version](https://badge.fury.io/js/inject-loader.svg)](http://badge.fury.io/js/inject-loader)


**A Webpack loader for injecting code into modules via their dependencies**

This is particularly useful for writing tests where mocking things inside your module-under-test is sometimes necessary before execution.

`inject-loader` was inspired by, and builds upon ideas introduced in [jauco/webpack-injectable](https://github.com/jauco/webpack-injectable).

### Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

Use the inject loader by adding `inject!` when you use `require`, this will return a function that can be passed things to inject.

By default all `require` statements in an injected module will be altered to be replaced with an injector.

This behaviour can be customised by passing along flags when using the loader to either explicitly include or exclude dependencies from being injected.

### Examples

Given some code in a module like this:

```javascript
// MyStore.js

var Dispatcher = require('lib/dispatcher');
var EventEmitter = require('events').EventEmitter;
var handleAction = require('lib/handle_action');

Dispatcher.register(handleAction, 'MyStore');
```

You can manipulate it’s dependencies when you come to write tests as follows:

```javascript
// If no flags are provided when using the loader then
// all require statements will be wrapped in an injector
MyModuleInjector = require('inject!MyStore')
MyModule = MyModuleInjector({
  'lib/dispatcher': DispatcherMock,
  'events': EventsMock,
  'lib/handle_action': HandleActionMock
})

// It is also possible to only mock only explicit require
// statements via passing in their path as a flag
MyModuleInjector = require('inject?lib/dispatcher!MyStore')
// only 'lib/dispatcher' is wrapped in an injector
MyModule = MyModuleInjector({'lib/dispatcher': DispatcherMock})

// this also works for multiple flags & requires
MyModuleInjector = require('inject?lib/dispatcher&events!MyStore')
// only 'lib/dispatcher' and 'events' are wrapped in injectors
MyModule = MyModuleInjector({
  'lib/dispatcher': DispatcherMock,
  'events': EventsMock
})

// you can also explicitly exclude dependencies from being injected
MyModuleInjector = require('inject?-lib/dispatcher!MyStore')
// everything except 'lib/dispatcher' is wrapped in an injector
MyModule = MyModuleInjector({
  'events': EventsMock,
  'lib/handle_action': HandleActionMock
})
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
