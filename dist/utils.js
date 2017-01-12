'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasOnlyExcludeFlags = hasOnlyExcludeFlags;
exports.quoteRegexString = quoteRegexString;
exports.escapeSlash = escapeSlash;
exports.unescapeQuote = unescapeQuote;
function hasOnlyExcludeFlags(query) {
  return Object.keys(query).filter(function (k) {
    return query[k] === true;
  }).length === 0;
}

function quoteRegexString() {
  return '[\'|\"]{1}';
}

function escapeSlash(path) {
  return path.replace('/', '\\/');
}

function unescapeQuote(path) {
  return path.replace(/'|"/g, '"');
}