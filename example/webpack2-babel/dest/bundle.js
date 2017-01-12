/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValue = getValue;

var _getFoo = __webpack_require__(3);

var _getFoo2 = _interopRequireDefault(_getFoo);

var _bar = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getValue() {
  return (0, _getFoo2.default)() * _bar.BAR;
}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

function injectWrapper() {
    var __injections = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var __wrappedModuleDependencies = ["\"getFoo\"","\"bar\""];

    (function __validateInjection() {
      var injectionKeys = Object.keys(__injections);
      var invalidInjectionKeys = injectionKeys.filter(function (x) {
        return __wrappedModuleDependencies.indexOf(x) === -1;
      });
      if (invalidInjectionKeys.length > 0) throw new Error('One or more of the injections you passed in is invalid for the module you are attempting to inject into.\n\n- Valid injection targets for this module are: ' + JSON.stringify(__wrappedModuleDependencies) + '\n- The following injections were passed in:     ' + JSON.stringify(injectionKeys) + '\n- The following injections are invalid:        ' + JSON.stringify(invalidInjectionKeys) + '\n');
    })();

    var module = { exports: {} };
    var exports = module.exports;

    function __injectRequire(dependency) {
      if (__injections.hasOwnProperty(dependency)) return __injections[dependency];
      return !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
    }

    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValue = getValue;

var _getFoo = __injectRequire("getFoo");

var _getFoo2 = _interopRequireDefault(_getFoo);

var _bar = __injectRequire("bar");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getValue() {
  return (0, _getFoo2.default)() * _bar.BAR;
}
    return module.exports;
  }

/***/ },
/* 2 */
/***/ function(module, exports) {

"use strict";
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var BAR = exports.BAR = 2;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFoo;
function getFoo() {
  return 10;
}

/***/ },
/* 4 */
/***/ function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 4;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

describe('Main', function () {
  var mainModule = void 0;

  it('works without injecting', function () {
    mainModule = __webpack_require__(0);
    expect(mainModule.getValue()).toEqual(20);
  });

  describe('injecting code into module dependencies', function () {
    var mainModuleInjector = void 0;

    beforeEach(function () {
      mainModuleInjector = __webpack_require__(1);
    });

    it('allows for injecting code into a subset of dependencies', function () {
      mainModule = mainModuleInjector({
        bar: { BAR: 5 }
      });
      expect(mainModule.getValue()).toEqual(50);

      mainModule = mainModuleInjector({
        getFoo: function getFoo() {
          return 10;
        }
      });
      expect(mainModule.getValue()).toEqual(20);
    });

    it('allows for injecting code mulitple dependencies', function () {
      mainModule = mainModuleInjector({
        getFoo: function getFoo() {
          return 5;
        },
        bar: { BAR: 5 }
      });
      expect(mainModule.getValue()).toEqual(25);
    });
  });
});

/***/ }
/******/ ]);