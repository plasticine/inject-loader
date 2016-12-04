import inject from '../src';

function createTestFunctionForInjector(injector: string): Function {
  return new Function(`(${injector}).apply(null, arguments);`);
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
    context = {
      query: '',
      resourcePath: '',
      cacheable: () => true
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
        expect(injectFn("require('lib/thing')")).toContain("__injectRequire('lib/thing')");
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

    describe('queries', () => {
      describe('empty', () => {
        test('injects all modules', () => {
          const injectedSrc = injectFn(SOURCE);
          expect(injectedSrc).toContain("var Dispatcher = __injectRequire('lib/dispatcher');");
          expect(injectedSrc).toContain("var EventEmitter = __injectRequire('events').EventEmitter;");
          expect(injectedSrc).toContain("var handleAction = __injectRequire('lib/handle_action');");
        });
      });

      describe('single specific injection', () => {
        beforeEach(() => {
          context.query = '?lib/dispatcher';
        });

        test('only injects the module from the query', () => {
          const injectedSrc = injectFn(SOURCE)
          expect(injectedSrc).toContain("var Dispatcher = __injectRequire('lib/dispatcher');");
          expect(injectedSrc).toContain("var EventEmitter = require('events').EventEmitter;");
          expect(injectedSrc).toContain("var handleAction = require('lib/handle_action');");
        });
      });

      describe('multiple specific injection', () => {
        test('injects all modules from the query', () => {
          beforeEach(() => {
            context.query = '?lib/dispatcher&events';
          });

          test('only injects the module from the query', () => {
            const injectedSrc = injectFn(SOURCE)
            expect(injectedSrc).toContain("var Dispatcher = __injectRequire('lib/dispatcher');");
            expect(injectedSrc).toContain("var EventEmitter = __injectRequire('events').EventEmitter;");
            expect(injectedSrc).toContain("var handleAction = require('lib/handle_action');");
          });
        });
      });

      describe('exculde single specific injection', () => {
        test('injects all modules except the one from the query', () => {
          beforeEach(() => {
            context.query = '?-lib/dispatcher';
          });

          test('only injects the module from the query', () => {
            const injectedSrc = injectFn(SOURCE)
            expect(injectedSrc).toContain("var Dispatcher = require('lib/dispatcher');");
            expect(injectedSrc).toContain("var EventEmitter = __injectRequire('events').EventEmitter;");
            expect(injectedSrc).toContain("var handleAction = __injectRequire('lib/handle_action');");
          });
        });
      });

      describe('exculde multiple specific injections', () => {
        test('injects all modules except the ones from the query', () => {
          beforeEach(() => {
            context.query = '?-lib/dispatcher&-events';
          });

          test('only injects the module from the query', () => {
            const injectedSrc = injectFn(SOURCE)
            expect(injectedSrc).toContain("var Dispatcher = require('lib/dispatcher');");
            expect(injectedSrc).toContain("var EventEmitter = require('events').EventEmitter;");
            expect(injectedSrc).toContain("var handleAction = __injectRequire('lib/handle_action');");
          });
        });
      });
    });
  });
});
