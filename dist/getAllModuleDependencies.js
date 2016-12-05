'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAllModuleDependencies;

var _utils = require('./utils');

function getAllModuleDependencies(source, pattern) {
  var match = void 0;
  var dependencies = [];
  while (match = pattern.exec(source)) {
    dependencies.push(match);
  }
  return dependencies.map(function (x) {
    return (0, _utils.unescapeQuote)(x[1]);
  });
}