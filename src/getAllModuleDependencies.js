// @flow

import {unescapeQuote} from './utils';

export default function getAllModuleDependencies(source: string, pattern: RegExp) {
  let match;
  let dependencies = [];
  while (match = pattern.exec(source)) {
    dependencies.push(match);
  }
  return dependencies.map(x => unescapeQuote(x[1]));
}
