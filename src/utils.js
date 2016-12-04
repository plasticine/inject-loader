// @flow

export function hasOnlyExcludeFlags(query: Object): boolean {
  return Object.keys(query).filter(k => query[k] === true).length === 0;
}

export function quoteRegexString(): string {
  return '[\'|\"]{1}';
}

export function escapeSlash(path: string): string {
  return path.replace('/', '\\/');
}

export function unescapeQuote(path: string): string {
  return path.replace(/\'/g, '');
}
