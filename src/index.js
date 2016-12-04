// @flow

import createRequireStringRegex from './createRequireStringRegex';
import getAllModuleDependencies from './getAllModuleDependencies';

const INJECTIONS_REGEX = new RegExp(/\$__INJECTIONS__/);
const WRAPPED_MODULE_DEPENDENCIES = new RegExp(/\$__WRAPPED_MODULE_DEPENDENCIES__/);

function createInjectorFunction({query, resourcePath}, source: string) {
  const requireStringRegex = createRequireStringRegex(query);
  const wrappedModuleDependencies = getAllModuleDependencies(source, requireStringRegex);
  const dependencyInjectionTemplate = source.replace(requireStringRegex, '__injectRequire($1)');

  if (wrappedModuleDependencies.length === 0)
    console.warn(`Inject Loader: The module you are trying to inject into (\`${resourcePath}\`) does not seem to have any dependencies, are you sure you want to do this?`);

  function injectWrapper(__injections = {}) {
    // $FlowIgnore
    const __wrappedModuleDependencies = $__WRAPPED_MODULE_DEPENDENCIES__;

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

    function __injectRequire(dependency: string) {
      if (__injections.hasOwnProperty(dependency))
        return __injections[dependency];
      // $FlowIgnore
      return require(dependency);
    }

    // $FlowIgnore
    $__INJECTIONS__
    return module.exports;
  }

  // lol.
  return injectWrapper
    .toString()
    .replace(INJECTIONS_REGEX, dependencyInjectionTemplate)
    .replace(WRAPPED_MODULE_DEPENDENCIES, JSON.stringify(wrappedModuleDependencies));
}

export default function inject(source: string): string {
  this.cacheable && this.cacheable();
  return createInjectorFunction(this, source);
}
