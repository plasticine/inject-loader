'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.quoteRegexString = quoteRegexString;
exports.escapeSlash = escapeSlash;
exports.unescapeQuote = unescapeQuote;
function quoteRegexString() {
  return '[\'|\"]{1}';
}

function escapeSlash(path) {
  return path.replace('/', '\\/');
}

function unescapeQuote(path) {
  return path.replace(/'|"/g, '"');
}