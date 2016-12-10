import createRequireStringRegex from '../src/createRequireStringRegex';

const SOURCE = `
  const foo = require("foo");
  const fooBar = require("foo/bar");
  const barFoo = require('bar/foo');
  const barFooToo = require('bar/foo too');
`;

fdescribe('createRequireStringRegex', function() {
  describe('empty query', () => {
    test('creates a regex that will match any require statement', () => {
      expect('require;'.match(createRequireStringRegex())).toBe(null);
      expect('require();'.match(createRequireStringRegex())).toBe(null);
      expect('require("");'.match(createRequireStringRegex())).toBe(null);
      expect(SOURCE.match(createRequireStringRegex())).toContain('require("foo")');
      expect(SOURCE.match(createRequireStringRegex())).toContain('require("foo/bar")');
      expect(SOURCE.match(createRequireStringRegex())).toContain("require('bar/foo')");
      expect(SOURCE.match(createRequireStringRegex())).toContain("require('bar/foo too')");
      expect(createRequireStringRegex().exec('require("foo");')[1]).toEqual('foo');
      expect(createRequireStringRegex().exec('require("foo/bar");')[1]).toEqual('foo/bar');
      expect(createRequireStringRegex().exec("require('bar/foo');")[1]).toEqual('bar/foo');
      expect(createRequireStringRegex().exec("require('bar/foo too');")[1]).toEqual('bar/foo too');
    });
  });
});
