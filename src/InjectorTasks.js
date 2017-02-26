// @flow

/**
 * Regular expression used for extracting and replacing the module dependencies.
 * @type {RegEx}
 */
const Injector_Regex = /([^\.])(require\([\'|\"]{1}([^\\)]+)[\'|\"]{1}\))/g;

/**
 * Parses source code and returns a list of dependencies by name.
 * @param  {string} source Source code with `require` statements.
 * @return {Array<string>} Names of dependencies used throughout the source code.
 */
export function getModuleDependencies (source: string): Array<string> {
  const foundModules: Array<string> = [];
  let x;
  while (x = Injector_Regex.exec(source))
  {
    foundModules.push(x[3])
  }
  return foundModules;
}

/**
 * Replaces occurrences of `require` with the injection function.
 * @param  {string} source Source code with `require` statements.
 * @return {string}        Source code with replaced require statements.
 */
export function replaceDependencies(source: string): string {
  return source.replace(Injector_Regex, `$1(__injection("$3") || require("$3"))`);
}

/**
 * Wrapper that is injected into the final source code.
 * Note: This is injected only and should not be called.
 * Exposed for testing purposes only.
 * @param  {object} __injections Injections from the bundler.
 * @return {object}              Exports from the wrapped module.
 */
export function __injectWrapper(__injections: any = {}) {
  const module = {exports: {}};
  const exports = module.exports;

  const __wrappedModuleDependencies: Array<string> = this.$__WRAPPED_MODULE_DEPENDENCIES__;

  const injectionKeys = Object.keys(__injections);
  const invalidInjectionKeys = injectionKeys.filter(x => __wrappedModuleDependencies.indexOf(x) === -1)

  if (invalidInjectionKeys.length > 0)
    throw new Error(`One or more of the injections you passed in is invalid for the module you are attempting to inject into.

- Valid injection targets for this module are: ${__wrappedModuleDependencies.join(' ')}
- The following injections were passed in:     ${injectionKeys.join(' ')}
- The following injections are invalid:        ${invalidInjectionKeys.join(' ')}
`)

  function __injection(dependency: string): ?any {
    return (__injections.hasOwnProperty(dependency) ? __injections[dependency] : null);
  }

  /*!************************************************************************/
  (() => {
    this.$__INJECTED_SOURCE__;
  })();
  /*!************************************************************************/

  return module.exports;
}

/**
 * Wraps a given source code in the injector, inserting injectable dependencies.
 * @param  {Array<string>} dependencies The names of dependencies that should be injected.
 * @param  {string} source              The source code.
 * @return {string}                     Source code with injected wrapper and dependencies.
 */
export function injectIntoWrapper(dependencies: Array<string>, source: string): string {
  return `module.exports = ${__injectWrapper.toString()}`
    .replace("_this.$__INJECTED_SOURCE__", source)
    .replace("this.$__WRAPPED_MODULE_DEPENDENCIES__", JSON.stringify(dependencies));
}
