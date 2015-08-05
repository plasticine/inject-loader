import loaderUtils from 'loader-utils';

function extractDependencies(inputSrc) {
  const regex = /require\(\'(.*)\'\)/gm;
  let dependencies = [];
  let matches = null;
  while ((matches = regex.exec(inputSrc)) !== null) {
    dependencies.push(matches[1]);
  }
  return dependencies;
}

function hasOnlyExcludeFlags(query) {
  return Object.keys(query).filter((key) => query[key] === true).length === 0;
}

function escapeSlashes(path) {
  return path.replace('/', '\\/');
}

function quoteRegexString() {
  return '[\'|\"]{1}';
}

function createRequireStringRegex(loaderQuery) {
  let regexArray = [];

  // if there is no query then replace everything
  if (Object.keys(loaderQuery).length === 0) {
    regexArray.push('([^\\)]+)');
  } else {
    // if there are only negation matches in the query then replace everything
    // except them
    if (hasOnlyExcludeFlags(loaderQuery)) {
      Object.keys(loaderQuery).forEach(key => regexArray.push(`(?!${quoteRegexString()}${escapeSlashes(key)})`));
      regexArray.push('([^\\)]+)');
    } else {
      regexArray.push(`(${quoteRegexString()}(`);
      regexArray.push(Object.keys(loaderQuery).map(key => escapeSlashes(key)).join('|'));
      regexArray.push(`)${quoteRegexString()})`);
    }
  }

  // Wrap the regex to match `require()`
  regexArray.unshift('require\\(');
  regexArray.push('\\)');

  return new RegExp(regexArray.join(''), 'g');
}

function __validateInjections__(injectionKeys, moduleDepKeys) {
  if (injectionKeys.some(x => moduleDepKeys.indexOf(x) === -1)) {
    throw new Error();
  }
}

export default function injectLoader(inputSrc) {
  if (this.cacheable) {
    this.cacheable();
  }
  const query = loaderUtils.parseQuery(this.query);
  const injectionRegex = createRequireStringRegex(query);
  const validInjectionKeys = extractDependencies(inputSrc);

  return `
module.exports = function __injector__(__injections__) {
  var module = {exports: {}};
  var __injections__ = __injections__ || {};
  var __moduleDepKeys__ = ${JSON.stringify(validInjectionKeys)};
  // Validate provided injection keys are valid for this modules dependencies.
  ${__validateInjections__.toString()}(Object.keys(__injections__), __moduleDepKeys__);
  ${inputSrc.replace(injectionRegex, '(__injections__[$1] || $&)')}
  return module.exports;
}`.trim();
}
