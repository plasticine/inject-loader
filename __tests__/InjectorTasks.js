import {
  getModuleDependencies,
  replaceDependencies,
  injectIntoWrapper,
  __injectWrapper
} from '../src/InjectorTasks.js'

describe('InjectorTasks', () => {
  describe('getModuleDependencies', () => {
    test('returning dependencies with single quotes', () => {
      const source = `var SingleQuote = require('lib/SingleQuote');`
      expect(getModuleDependencies(source)).toEqual(["lib/SingleQuote"])
    });
    test('returning dependencies with double quotes', () => {
      const source = `var SingleQuote = require("lib/DoubleQuote");`
      expect(getModuleDependencies(source)).toEqual(["lib/DoubleQuote"])
    });
    test('returning multiple dependencies on the same line', () => {
      const source = `var FirstOnLine = require('lib/FirstOnLine'); var SecondOnLine = require('lib/SecondOnLine');`
      expect(getModuleDependencies(source)).toEqual(["lib/FirstOnLine", "lib/SecondOnLine"])
    });
    test('returning dependencies with properties', () => {
      const source = `var WithProperty = require('WithProperty');`
      expect(getModuleDependencies(source)).toEqual(["WithProperty"])
    });
    test('returning dependencies directly after an equals sign', () => {
      const source = `var AfterEquals =require('AfterEquals');`
      expect(getModuleDependencies(source)).toEqual(["AfterEquals"])
    });
    test('returning dependencies with functions happen to be called \'require\'', () => {
      const source = `var Bar = Foo.require('AmFunction');`
      expect(getModuleDependencies(source)).toEqual([])
    });
    test('returning dependencies that are further down the file', () => {
      const source = `first line
      second line
      third line
      var EndOfFile = require('EndOfFile');
      `
      expect(getModuleDependencies(source)).toEqual(["EndOfFile"])
    });
  });
  describe('replaceDependencies', () => {
    test('replacing with double quotes', () => {
      const source = `var Foo = require("Foo");`;
      expect(replaceDependencies(source)).toEqual(`var Foo = (__injection("Foo") || require("Foo"));`);
    });
    test('replacing with single quotes', () => {
      const source = `var Foo = require('Foo');`;
      expect(replaceDependencies(source)).toEqual(`var Foo = (__injection("Foo") || require("Foo"));`);
    });
    test('replacing multiple require lines', () => {
      const source = `
var Foo = require("Foo");
var Baz = require("Baz");
`;
      expect(replaceDependencies(source)).toEqual(`
var Foo = (__injection("Foo") || require("Foo"));
var Baz = (__injection("Baz") || require("Baz"));
`);
    });
    test('objects that have a \'require\' property are not mocked', () => {
      const source = `
var Foo = require("Foo");
var Baz = Foo.require("Baz");
`;
      expect(replaceDependencies(source)).toEqual(`
var Foo = (__injection("Foo") || require("Foo"));
var Baz = Foo.require("Baz");
`);
    });
    test('requires after an equals sign still inject', () => {
      const source = `
var Foo=require("Foo");
var Baz =Foo.require("Baz");
`;
      expect(replaceDependencies(source)).toEqual(`
var Foo=(__injection("Foo") || require("Foo"));
var Baz =Foo.require("Baz");
`);
    });
    test('multiple requires on the same line', () => {
      const source = `var Foo=require("Foo"), Baz =Foo.require("Baz"); var Bar = require("Bar");`;
      expect(replaceDependencies(source)).toEqual(`var Foo=(__injection("Foo") || require("Foo")), Baz =Foo.require("Baz"); var Bar = (__injection("Bar") || require("Bar"));`);
    });
  });
  describe('__injectWrapper', () => {
    test('when some injections are invalid an error is thrown', () => {
      const context = {
        $__WRAPPED_MODULE_DEPENDENCIES__: ["injected", "anotherInected"]
      }

      const fn = __injectWrapper.bind(context, { notInjected: null, alsoNotInjected: null, injected: null })
      expect(fn).toThrow(`One or more of the injections you passed in is invalid for the module you are attempting to inject into.

- Valid injection targets for this module are: injected anotherInected
- The following injections were passed in:     notInjected alsoNotInjected injected
- The following injections are invalid:        notInjected alsoNotInjected
`);
    });
    test('when all injections are invalid an error is thrown', () => {
      const context = {
        $__WRAPPED_MODULE_DEPENDENCIES__: ["injected", "anotherInected"]
      }

      const fn = __injectWrapper.bind(context, { notInjected: null, alsoNotInjected: null })
      expect(fn).toThrow(`One or more of the injections you passed in is invalid for the module you are attempting to inject into.

- Valid injection targets for this module are: injected anotherInected
- The following injections were passed in:     notInjected alsoNotInjected
- The following injections are invalid:        notInjected alsoNotInjected
`);
    });
    test('when all injections are valid not error should be thrown', () => {
      const context = {
        $__WRAPPED_MODULE_DEPENDENCIES__: ["injected", "anotherInected"]
      }

      const fn = __injectWrapper.bind(context, { injected: null, anotherInected: null })
      expect(fn).not.toThrow();
    });
  });
  describe('injectIntoWrapper', () => {
    test('injected modules should be accessible from source', () => {
      const newSource = injectIntoWrapper(["injected"], `module.exports = (__injection("injected"))`)
      const exports = eval(newSource)({ injected: "thisWasInjected" });
      expect(exports).toEqual("thisWasInjected");
    });
  });
});
