import loaderUtils from 'loader-utils';

function hasOnlyExcludeFlags(query) {
  return Object.keys(query).filter(k => query[k] === true).length === 0;
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
  const regexArray = [];

  // if there is no query then replace everything
  if (Object.keys(query).length === 0) {
    regexArray.push('([^\\)]+)');
  } else {
    // if there are only negation matches in the query then replace everything
    // except them
    if (hasOnlyExcludeFlags(query)) {
      Object.keys(query).forEach(key => {
        regexArray.push(`(?!${quoteRegexString() + escapeSlash(key)})`);
      });
      regexArray.push('([^\\)]+)');
    } else {
      regexArray.push(`(${quoteRegexString()}(`);
      regexArray.push(Object.keys(query).map(escapeSlash).join('|'));
      regexArray.push(`)${quoteRegexString()})`);
    }
  }

  // Wrap the regex to match `require()`
  regexArray.unshift('require\\(');
  regexArray.push('\\)');

  return new RegExp(regexArray.join(''), 'g');
};

function getAllModuleDependencies(source, pattern) {
  let match;
  let dependencies = [];
  while (match = pattern.exec(source)) {
    dependencies.push(match);
  }
  return dependencies.map(x => x[1]).map(unescapeQuote);
}

function createInjectorFunction({query, resourcePath}, source) {
  const requireStringRegex = createRequireStringRegex(loaderUtils.parseQuery(query));
  const wrappedModuleDependencies = getAllModuleDependencies(source, requireStringRegex);
  const dependencyInjectionTemplate = source.replace(requireStringRegex, '__injectRequire($1)');

  if (wrappedModuleDependencies.length === 0)
    console.warn(`Inject Loader: The module you are trying to inject into (\`${resourcePath}\`) does not seem to have any dependencies, are you sure you want to do this?`);

  function injectWrapper(__injections = {}) {
    const __wrappedModuleDependencies = __WRAPPED_MODULE_DEPENDENCIES__;

    (function __validateInjection() {
      const injectionKeys = Object.keys(__injections);
      const invalidInjectionKeys = injectionKeys.filter(x => __wrappedModuleDependencies.indexOf(x) === -1)
      if (invalidInjectionKeys.length > 0)
        throw new Error(`One or more of the injections you passed in is invalid for the module you are attempting to inject into.

- Valid injection targets for this module are: ${JSON.stringify(__wrappedModuleDependencies)}
- The following injections were passed in:     ${JSON.stringify(injectionKeys)}
- The following injections are invalid:        ${JSON.stringify(invalidInjectionKeys)}
`)
    })()

    const module = {exports: {}};
    const exports = module.exports;

    function __injectRequire(dependency) {
      if (__injections.hasOwnProperty(dependency))
        return __injections[dependency];
      return require(dependency);
    }

    __INJECTIONS__
    return module.exports;
  }

  // lol.
  return injectWrapper
    .toString()
    .replace(new RegExp(/__INJECTIONS__;/), dependencyInjectionTemplate)
    .replace(new RegExp(/__WRAPPED_MODULE_DEPENDENCIES__/), JSON.stringify(wrappedModuleDependencies));
}


function inject(source) {
  this.cacheable && this.cacheable();
  return createInjectorFunction(this, source);
}

module.exports = inject;
