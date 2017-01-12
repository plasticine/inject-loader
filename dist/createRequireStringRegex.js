'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRequireStringRegex;

var _utils = require('./utils');

var MATCH_ALL_REQUIRE_STATEMENTS = (0, _utils.quoteRegexString)() + '([^\\)]+)' + (0, _utils.quoteRegexString)();

function createRequireStringRegex() {
  var regexArray = ['require\\(', MATCH_ALL_REQUIRE_STATEMENTS, '\\)'];
  return new RegExp(regexArray.join(''), 'g');
}