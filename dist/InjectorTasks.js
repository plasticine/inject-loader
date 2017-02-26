'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModuleDependencies = getModuleDependencies;
exports.replaceDependencies = replaceDependencies;
exports.__injectWrapper = __injectWrapper;
exports.injectIntoWrapper = injectIntoWrapper;


/**
 * Regular expression used for extracting and replacing the module dependencies.
 * @type {RegEx}
 */
var Injector_Regex = /([^\.])(require\([\'|\"]{1}([^\\)]+)[\'|\"]{1}\))/g;

/**
 * Parses source code and returns a list of dependencies by name.
 * @param  {string} source Source code with `require` statements.
 * @return {Array<string>} Names of dependencies used throughout the source code.
 */
function getModuleDependencies(source) {
  var foundModules = [];
  var x = void 0;
  while (x = Injector_Regex.exec(source)) {
    foundModules.push(x[3]);
  }
  return foundModules;
}

/**
 * Replaces occurrences of `require` with the injection function.
 * @param  {string} source Source code with `require` statements.
 * @return {string}        Source code with replaced require statements.
 */
function replaceDependencies(source) {
  return source.replace(Injector_Regex, '$1(__injection("$3") || require("$3"))');
}

/**
 * Wrapper that is injected into the final source code.
 * Note: This is injected only and should not be called.
 * Exposed for testing purposes only.
 * @param  {object} __injections Injections from the bundler.
 * @return {object}              Exports from the wrapped module.
 */
function __injectWrapper() {
  var _this = this;

  var __injections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var module = { exports: {} };
  var exports = module.exports;

  var __wrappedModuleDependencies = this.$__WRAPPED_MODULE_DEPENDENCIES__;

  var injectionKeys = Object.keys(__injections);
  var invalidInjectionKeys = injectionKeys.filter(function (x) {
    return __wrappedModuleDependencies.indexOf(x) === -1;
  });

  if (invalidInjectionKeys.length > 0) throw new Error('One or more of the injections you passed in is invalid for the module you are attempting to inject into.\n\n- Valid injection targets for this module are: ' + __wrappedModuleDependencies.join(' ') + '\n- The following injections were passed in:     ' + injectionKeys.join(' ') + '\n- The following injections are invalid:        ' + invalidInjectionKeys.join(' ') + '\n');

  function __injection(dependency) {
    return __injections.hasOwnProperty(dependency) ? __injections[dependency] : null;
  }

  /*!************************************************************************/
  (function () {
    _this.$__INJECTED_SOURCE__;
  })();
  /*!************************************************************************/

  return module.exports;
}

/**
 * Wraps a given source code in the injector, inserting injectable dependencies.
 * @param  {Array<string>} dependencies The names of dependencies that should be injected.
 * @param  {string} source              The source code.
 * @return {string}                     Source code with injected wrapper and dependencies.
 */
function injectIntoWrapper(dependencies, source) {
  return ('module.exports = ' + __injectWrapper.toString()).replace("_this.$__INJECTED_SOURCE__", source).replace("this.$__WRAPPED_MODULE_DEPENDENCIES__", JSON.stringify(dependencies));
}