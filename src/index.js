import injectify from './injectify.js';

module.exports = function injectifyLoader(source, inputSourceMap) {
  if (this.cacheable) {
    this.cacheable();
  }

  const { code, map } = injectify(this, source, inputSourceMap);
  this.callback(null, code, map);
};
