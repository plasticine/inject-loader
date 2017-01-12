'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRequireStringRegex;

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRequireStringRegex() {
  var querystring = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var query = _loaderUtils2.default.parseQuery(querystring);
  var regexArray = [];

  // if there is no query then replace everything
  if (Object.keys(query).length === 0) {
    regexArray.push((0, _utils.quoteRegexString)() + '([^\\)]+)' + (0, _utils.quoteRegexString)());
  } else {
    // if there are only negation matches in the query then replace everything
    // except them
    if ((0, _utils.hasOnlyExcludeFlags)(query)) {
      Object.keys(query).forEach(function (key) {
        regexArray.push('(?!' + ((0, _utils.quoteRegexString)() + (0, _utils.escapeSlash)(key)) + ')');
      });
      regexArray.push('([^\\)]+)');
    } else {
      regexArray.push('(' + (0, _utils.quoteRegexString)() + '(');
      regexArray.push(Object.keys(query).map(_utils.escapeSlash).join('|'));
      regexArray.push(')' + (0, _utils.quoteRegexString)() + ')');
    }
  }

  // Wrap the regex to match `require()`
  regexArray.unshift('require\\(');
  regexArray.push('\\)');

  return new RegExp(regexArray.join(''), 'g');
};