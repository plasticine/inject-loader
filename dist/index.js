'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inject;

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INJECTIONS_REGEX = new RegExp(/\$__INJECTIONS__/);

var WRAPPED_MODULE_DEPENDENCIES = new RegExp(/\$__WRAPPED_MODULE_DEPENDENCIES__/);

function hasOnlyExcludeFlags(query) {
  return Object.keys(query).filter(function (k) {
    return query[k] === true;
  }).length === 0;
}

function escapeSlash(path) {
  return path.replace('/', '\\/');
}

function unescapeQuote(path) {
  return path.replace(/\'/g, '');
}

function quoteRegexString() {
  return '[\'|\"]{1}';
}

function createRequireStringRegex(query) {
  var regexArray = [];

  // if there is no query then replace everything
  if (Object.keys(query).length === 0) {
    regexArray.push('([^\\)]+)');
  } else {
    // if there are only negation matches in the query then replace everything
    // except them
    if (hasOnlyExcludeFlags(query)) {
      Object.keys(query).forEach(function (key) {
        regexArray.push('(?!' + (quoteRegexString() + escapeSlash(key)) + ')');
      });
      regexArray.push('([^\\)]+)');
    } else {
      regexArray.push('(' + quoteRegexString() + '(');
      regexArray.push(Object.keys(query).map(escapeSlash).join('|'));
      regexArray.push(')' + quoteRegexString() + ')');
    }
  }

  // Wrap the regex to match `require()`
  regexArray.unshift('require\\(');
  regexArray.push('\\)');

  return new RegExp(regexArray.join(''), 'g');
};

function getAllModuleDependencies(source, pattern) {
  var match = void 0;
  var dependencies = [];
  while (match = pattern.exec(source)) {
    dependencies.push(match);
  }
  return dependencies.map(function (x) {
    return x[1];
  }).map(unescapeQuote);
}

function createInjectorFunction(_ref, source) {
  var query = _ref.query,
      resourcePath = _ref.resourcePath;

  var requireStringRegex = createRequireStringRegex(_loaderUtils2.default.parseQuery(query));
  var wrappedModuleDependencies = getAllModuleDependencies(source, requireStringRegex);
  var dependencyInjectionTemplate = source.replace(requireStringRegex, '__injectRequire($1)');

  if (wrappedModuleDependencies.length === 0) console.warn('Inject Loader: The module you are trying to inject into (`' + resourcePath + '`) does not seem to have any dependencies, are you sure you want to do this?');

  function injectWrapper() {
    var __injections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // $FlowIgnore
    var __wrappedModuleDependencies = $__WRAPPED_MODULE_DEPENDENCIES__;

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
      // $FlowIgnore
      return require(dependency);
    }

    // $FlowIgnore
    $__INJECTIONS__;
    return module.exports;
  }

  // lol.
  return injectWrapper.toString().replace(INJECTIONS_REGEX, dependencyInjectionTemplate).replace(WRAPPED_MODULE_DEPENDENCIES, JSON.stringify(wrappedModuleDependencies));
}

function inject(source) {
  this.cacheable && this.cacheable();
  return createInjectorFunction(this, source);
}