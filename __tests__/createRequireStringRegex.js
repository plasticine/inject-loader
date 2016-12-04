import createRequireStringRegex from '../src/createRequireStringRegex';

const SOURCE = `
  const foo = require("foo");
  const fooBar = require("foo/bar");
  const barFoo = require('bar/foo');
`;

describe('createRequireStringRegex', function() {
  describe('empty querystring', () => {
    test('creates a regex that will match any require statement', () => {
      expect(createRequireStringRegex().exec('require;')).toBe(null);
      expect(createRequireStringRegex().exec('require();')).toBe(null);
      expect(createRequireStringRegex().exec('require("");')).toBe(null);

      expect(createRequireStringRegex().exec(SOURCE)[0]).toEqual('require("foo")');
      expect(createRequireStringRegex().exec(SOURCE)[1]).toEqual('"foo"');
    });
  });

  describe('select querystring', () => {
    test('creates a regex that will only match require statements for the specified selections', () => {
      expect(createRequireStringRegex('?foo/bar').exec('require;')).toBe(null);
      expect(createRequireStringRegex('?foo/bar').exec('require();')).toBe(null);
      expect(createRequireStringRegex('?foo/bar').exec('require("");')).toBe(null);

      expect(createRequireStringRegex('?foo/bar').exec(SOURCE)[0]).toEqual('require("foo/bar")');
      expect(createRequireStringRegex('?foo/bar').exec(SOURCE)[1]).toEqual('"foo/bar"');

      const multipleSelections = SOURCE.match(createRequireStringRegex('?foo/bar&bar/foo'));
      expect(multipleSelections[0]).toEqual('require("foo/bar")');
      expect(multipleSelections[1]).toEqual("require('bar/foo')");
    });
  });

  describe('exclude querystring', () => {
    test('creates a regex that will only match require statements for the specified selections', () => {
      expect(createRequireStringRegex('?!foo/bar').exec('require;')).toBe(null);
      expect(createRequireStringRegex('?!foo/bar').exec('require();')).toBe(null);
      expect(createRequireStringRegex('?!foo/bar').exec('require("");')).toBe(null);
      expect(createRequireStringRegex('?!foo/bar').exec(SOURCE)).toBe(null);
      expect(createRequireStringRegex('?!foo/bar').exec(SOURCE)).toBe(null);

      console.log(createRequireStringRegex('?!foo/bar'))
    });
  });

  //   expect(createRequireStringRegex('?foo/bar')).toEqual(/require\((['|"]{1}(foo\/bar)['|"]{1})\)/g);
  //   expect(createRequireStringRegex('?foo/bar&bar/foo')).toEqual(/require\((['|"]{1}(foo\/bar|bar\/foo)['|"]{1})\)/g);

  //   expect(createRequireStringRegex('?!foo/bar')).toEqual(/require\((['|"]{1}(!foo\/bar)['|"]{1})\)/g);
  //   expect(createRequireStringRegex('?!foo/bar&!bar/foo')).toEqual(/require\((['|"]{1}(!foo\/bar|!bar\/foo)['|"]{1})\)/g);

  //   expect(createRequireStringRegex('?foo/bar&bar/foo&!foo/bar&!bar/foo')).toEqual(/require\((['|"]{1}(foo\/bar|bar\/foo|!foo\/bar|!bar\/foo)['|"]{1})\)/g);
  // });
});
