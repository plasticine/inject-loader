// @flow

import {quoteRegexString, escapeSlash} from './utils';

const MATCH_ALL_REQUIRE_STATEMENTS = `${quoteRegexString()}([^\\)]+)${quoteRegexString()}`;

export default function createRequireStringRegex(): RegExp {
  const regexArray = ['require\\(', MATCH_ALL_REQUIRE_STATEMENTS, '\\)'];
  return new RegExp(regexArray.join(''), 'g');
}
