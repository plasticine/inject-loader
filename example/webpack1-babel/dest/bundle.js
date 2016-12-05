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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	describe('Main', function () {
	  var entry = void 0;

	  beforeEach(function () {
	    entry = __webpack_require__(1)({
	      foo: {
	        getFoo: function getFoo() {
	          return 1;
	        }
	      }
	    });
	  });

	  it('works without override', function () {
	    expect(__webpack_require__(4).getValue()).to.equal(20);
	  });

	  it('overrides', function () {
	    expect(entry.getValue()).to.equal(2);
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function __injectWrapper() {
	    var __injections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var module = { exports: {} };
	    var exports = module.exports;

	    // $FlowIgnore
	    var __wrappedModuleDependencies = ["foo","bar"];

	    (function __validateInjection() {
	      var injectionKeys = Object.keys(__injections);
	      var invalidInjectionKeys = injectionKeys.filter(function (x) {
	        return __wrappedModuleDependencies.indexOf(x) === -1;
	      });

	      if (invalidInjectionKeys.length > 0) throw new Error('One or more of the injections you passed in is invalid for the module you are attempting to inject into.\n\n- Valid injection targets for this module are: ' + __wrappedModuleDependencies.join(' ') + '\n- The following injections were passed in:     ' + injectionKeys.join(' ') + '\n- The following injections are invalid:        ' + invalidInjectionKeys.join(' ') + '\n');
	    })();

	    function __injection(dependency) {
	      return __injections.hasOwnProperty(dependency) ? __injections[dependency] : null;
	    }

	    /*!************************************************************************/
	    (function () {
	      // $FlowIgnore
	      "use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getValue = getValue;

	var _foo = (__injection("foo") || __webpack_require__(2));

	var _bar = (__injection("bar") || __webpack_require__(3));

	function getValue() {
	  return (0, _foo.getFoo)() * (0, _bar.getBar)();
	}
	    })();
	    /*!************************************************************************/

	    return module.exports;
	  }

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getFoo = getFoo;
	function getFoo() {
	  return (10);
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getBar = getBar;
	function getBar() {
	  return 2;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getValue = getValue;

	var _foo = __webpack_require__(2);

	var _bar = __webpack_require__(3);

	function getValue() {
	  return (0, _foo.getFoo)() * (0, _bar.getBar)();
	}

/***/ }
/******/ ]);