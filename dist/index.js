'use strict';

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _createRequireStringRegex = require('./createRequireStringRegex');

var _createRequireStringRegex2 = _interopRequireDefault(_createRequireStringRegex);

var _getAllModuleDependencies = require('./getAllModuleDependencies');

var _getAllModuleDependencies2 = _interopRequireDefault(_getAllModuleDependencies);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __INJECTED_SOURCE_REGEX = new RegExp(/\$__INJECTED_SOURCE__;/);

var __WRAPPED_MODULE_DEPENDENCIES_REGEX = new RegExp(/\$__WRAPPED_MODULE_DEPENDENCIES__;/);
var __WRAPPED_MODULE_REPLACEMENT = '(__injection("$1") || require("$1"))';

function __createInjectorFunction(_ref, source) {
  var query = _ref.query,
      resourcePath = _ref.resourcePath;

  // const query = loaderUtils.parseQuery(querystring);
  var requireStringRegex = (0, _createRequireStringRegex2.default)(query);
  var wrappedModuleDependencies = (0, _getAllModuleDependencies2.default)(source, requireStringRegex);
  var dependencyInjectedSource = source.replace(requireStringRegex, __WRAPPED_MODULE_REPLACEMENT);

  if (wrappedModuleDependencies.length === 0) console.warn('Inject Loader: The module you are trying to inject into (`' + resourcePath + '`) does not seem to have any dependencies, are you sure you want to do this?');

  function __injectWrapper() {
    var __injections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var module = { exports: {} };
    var exports = module.exports;

    // $FlowIgnore
    var __wrappedModuleDependencies = $__WRAPPED_MODULE_DEPENDENCIES__;

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
      $__INJECTED_SOURCE__;
    })();
    /*!************************************************************************/

    return module.exports;
  }

  // lol.
  return ('module.exports = ' + __injectWrapper.toString()).replace(__INJECTED_SOURCE_REGEX, dependencyInjectedSource).replace(__WRAPPED_MODULE_DEPENDENCIES_REGEX, JSON.stringify(wrappedModuleDependencies) + ';');
}

module.exports = function inject(source) {
  this.cacheable && this.cacheable();
  return __createInjectorFunction(this, source);
};