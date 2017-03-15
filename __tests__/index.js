import inject from '../src';

const InjectMatchers = {
  toHaveInjectedDependency(util, customEqualityTesters) {
    return {
      compare(source, dependency) {
        const result = {};
        result.pass = util.contains(source, `(__injection("${dependency}") || require("${dependency}")`);

        if (result.pass) {
          result.message = `Expected "${source}" not to contain injection for "${dependency}"`;
        } else {
          result.message = `Expected "${source}" to contain injection for "${dependency}"`;
        }

        return result;
      }
    }
  }
}

function createTestFunctionForInjector(injector: string): Function {
  return new Function(`var module = {exports: {}}; (${injector}).apply(null, arguments);`);
}

const SOURCE = `
  var Dispatcher = require('lib/dispatcher'); var Herp = require('Derp');
  var EventEmitter = require('events').EventEmitter;
  const emitter = new EventEmitter();

  if (something)
    var handleAction = require('lib/handle_action');

  Dispatcher.register(handleAction, 'MyStore');
`;

describe('inject-loader', function() {
  let injectFn;
  let context;

  beforeAll(() => {
    jasmine.addMatchers(InjectMatchers);
    context = {
      query: '',
      resourcePath: '',
      cacheable: () => true,
      options: {}
    }
    injectFn = inject.bind(context)
  })

  beforeEach(() => {
    context.cacheable = jest.fn(() => true);
  });

  test('it is cacheable', () => {
    expect(context.cacheable).not.toHaveBeenCalled();
    injectFn('require("foo")');
    expect(context.cacheable).toHaveBeenCalled();
  });

  describe('loader', () => {
    describe('injecting', () => {
      test('injects all require statements by default', () => {
        const injectedSrc = injectFn(SOURCE);
        expect(injectedSrc).toHaveInjectedDependency('lib/dispatcher');
        expect(injectedSrc).toHaveInjectedDependency('events');
        expect(injectedSrc).toHaveInjectedDependency('lib/handle_action');
      });

      test('provides export variable to support use with CJS and Babel', () => {
        expect(injectFn("require('lib/thing')")).toContain("var module = { exports: {} };");
        expect(injectFn("require('lib/thing')")).toContain("var exports = module.exports;");
      });

      test('returns the wrapped module exports', () => {
        expect(injectFn("require('lib/thing')")).toContain("return module.exports;");
      });

      test('returns a injector function that can inject dependencies', () => {
        const someModuleStub = jest.fn(() => true);
        const injectWrapper = createTestFunctionForInjector(injectFn("require('someModule')('foobar');"));
        injectWrapper({someModule: someModuleStub});
        expect(someModuleStub).toHaveBeenCalledWith('foobar');
      });

      test('warns when the injected module contains no dependencies', () => {
        const _console = console;
        console = {warn: jest.fn()}
        context.resourcePath = 'my/sillyModule.js';
        const injectWrapper = createTestFunctionForInjector(injectFn("var sillyCode = true;"));
        expect(console.warn).toHaveBeenCalledWith('Inject Loader: The module you are trying to inject into (`my/sillyModule.js`) does not seem to have any dependencies, are you sure you want to do this?');
        console = _console;
      });

      test('throws an error if the user tries to specify an injection that doesnt exist', () => {
        const someModuleStub = jest.fn(() => true);
        const injectWrapper = createTestFunctionForInjector(injectFn("require('someModule')('foobar');"));
        expect(() =>
          injectWrapper({
            someModule: someModuleStub,
            derp: () => { return; }
          })
        ).toThrowError(/One or more of the injections you passed in is invalid for the module you are attempting to inject into./);
      });
    });
  });
});
