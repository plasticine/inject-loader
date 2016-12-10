// @flow

export function quoteRegexString(): string {
  return '[\'|\"]{1}';
}

export function escapeSlash(path: string): string {
  return path.replace('/', '\\/');
}

export function unescapeQuote(path: string): string {
  return path.replace(/'|"/g, '"');
}
