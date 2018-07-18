// @flow

import injectify from './injectify.js';

export default function injectifyLoader(source: string, inputSourceMap: string) {
  if (this.cacheable) {
    this.cacheable();
  }

  const {code, map} = injectify(this, source, inputSourceMap, this.query || {});
  this.callback(null, code, map);
}
