import injectify from './injectify.js';

export default function injectifyLoader(source, inputSourceMap) {
  if (this.cacheable) {
    this.cacheable();
  }

  const { code, map } = injectify(this, source, inputSourceMap);
  this.callback(null, code, map);
}
