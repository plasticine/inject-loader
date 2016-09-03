'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inject;

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasOnlyExcludeFlags(query) {
  return Object.keys(query).filter(function (k) {
    return query[k] === true;
  }).length === 0;
}

function escapePath(path) {
  return path.replace('/', '\\/');
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
        regexArray.push('(?!' + (quoteRegexString() + escapePath(key)) + ')');
      });
      regexArray.push('([^\\)]+)');
    } else {
      regexArray.push('(' + quoteRegexString() + '(');
      regexArray.push(Object.keys(query).map(escapePath).join('|'));
      regexArray.push(')' + quoteRegexString() + ')');
    }
  }

  // Wrap the regex to match `require()`
  regexArray.unshift('require\\(');
  regexArray.push('\\)');

  return new RegExp(regexArray.join(''), 'g');
};

function inject(src) {
  this.cacheable && this.cacheable();
  var regex = createRequireStringRegex(_loaderUtils2.default.parseQuery(this.query));

  return 'module.exports = function inject(injections) {\nvar module = {exports: {}};\nvar exports = module.exports;\n' + src.replace(regex, '(injections.hasOwnProperty($1) ? injections[$1] : $&)') + ';\nreturn module.exports;\n}';
}