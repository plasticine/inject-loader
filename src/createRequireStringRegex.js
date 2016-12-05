// @flow

import loaderUtils from 'loader-utils';
import {hasOnlyExcludeFlags, quoteRegexString, escapeSlash} from './utils';

export default function createRequireStringRegex(querystring: string = ''): RegExp {
  const query = loaderUtils.parseQuery(querystring);
  const regexArray = [];

  // if there is no query then replace everything
  if (Object.keys(query).length === 0) {
    regexArray.push(`${quoteRegexString()}([^\\)]+)${quoteRegexString()}`);
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
