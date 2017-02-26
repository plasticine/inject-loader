// @flow

import {
  getModuleDependencies,
  replaceDependencies,
  injectIntoWrapper
} from './InjectorTasks.js'

/**
 * Main inject function.
 * Checks source has dependencies places it inside an injection wrapper.
 * @param  {string} source Source code from the bundler.
 * @return {string}        Source code wrapped with an injection layer.
 */
export default function inject(source: string): string {
  this.cacheable && this.cacheable();

  const dependencies = getModuleDependencies(source);
  if (dependencies.length === 0)
    console.warn(`Inject Loader: The module you are trying to inject into ('${this.resourcePath}') does not seem to have any dependencies, are you sure you want to do this?`);

  return injectIntoWrapper(dependencies, replaceDependencies(source));
}
