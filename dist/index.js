'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inject;

var _InjectorTasks = require('./InjectorTasks.js');

/**
 * Main inject function.
 * Checks source has dependencies places it inside an injection wrapper.
 * @param  {string} source Source code from the bundler.
 * @return {string}        Source code wrapped with an injection layer.
 */
function inject(source) {
  this.cacheable && this.cacheable();

  var dependencies = (0, _InjectorTasks.getModuleDependencies)(source);
  if (dependencies.length === 0) console.warn('Inject Loader: The module you are trying to inject into (\'' + this.resourcePath + '\') does not seem to have any dependencies, are you sure you want to do this?');

  return (0, _InjectorTasks.injectIntoWrapper)(dependencies, (0, _InjectorTasks.replaceDependencies)(source));
}

module.exports = exports['default'];