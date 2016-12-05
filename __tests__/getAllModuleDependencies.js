import getAllModuleDependencies from '../src/getAllModuleDependencies';

const SOURCE = `
  const foo = require("foo");
  const fooBar = require("foo/bar");
  const barFoo = require('bar/foo');
`;

describe('getAllModuleDependencies', function() {
  test.skip('', () => {
    test(getAllModuleDependencies())
  });
});
