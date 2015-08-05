import injectLoader from '../src';
import sinon from 'sinon';
import {expect} from 'chai';

const commonjsModuleFixture = `
  var Dispatcher = require('lib/dispatcher');
  var EventEmitter = require('events').EventEmitter;
  var handleAction = require('lib/handle_action');

  Dispatcher.register(handleAction, 'MyStore');
`;


describe('inject-loader', function() {
  before(() => {
    this.context = {
      cacheable: () => { return; }
    };
    this.injectLoader = injectLoader.bind(this.context);
  });

  beforeEach(() => {
    this.contextMock = sinon.mock(this.context);
  });

  it('is cacheable', () => {
    this.contextMock.expects('cacheable').once();
    this.injectLoader('');
    this.contextMock.verify();
  });

  describe('injecting code into a module via its dependencies', () => {
    it('injects all dependencies by default', () => {
      const src = `require('lib/thing')`;
      const replacement = `(__injections__['lib/thing'] || require('lib/thing'))`;
      expect(this.injectLoader(src)).to.have.string(replacement);
    });

    xit('allows code to be injected into the module via the injector function', () => {
      // const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
    });

    describe('controlling injection targets via loader query', () => {
      describe('no query', () => {
        beforeEach(() => {
          this.context.query = null;
        });

        it('provides an injector for all module dependencies', () => {
          const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
          expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);
        });
      });

      describe('single specific injection', () => {
        beforeEach(() => {
          this.context.query = '?lib/dispatcher';
        });

        it('only injects the specified dependency', () => {
          const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
          expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          expect(moduleInjectorFn).to.have.string(`var EventEmitter = require('events').EventEmitter;`);
          expect(moduleInjectorFn).to.have.string(`var handleAction = require('lib/handle_action');`);
        });
      });

      describe('multiple specific injection', () => {
        beforeEach(() => {
          this.context.query = '?lib/dispatcher&events';
        });

        it('injects all modules from the query', () => {
          const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
          expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          expect(moduleInjectorFn).to.have.string(`var handleAction = require('lib/handle_action');`);
        });
      });

      describe('exculde single specific injection', () => {
        beforeEach(() => {
          this.context.query = '?-lib/dispatcher';
        });

        it('injects all modules except the one from the query', () => {
          const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
          expect(moduleInjectorFn).to.have.string(`var Dispatcher = require('lib/dispatcher');`);
          expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);
        });
      });

      describe('exculde multiple specific injections', () => {
        beforeEach(() => {
          this.context.query = '?-lib/dispatcher&-events';
        });

        it('injects all modules except the ones from the query', () => {
          const moduleInjectorFn = this.injectLoader(commonjsModuleFixture);
          expect(moduleInjectorFn).to.have.string(`var Dispatcher = require('lib/dispatcher');`);
          expect(moduleInjectorFn).to.have.string(`var EventEmitter = require('events').EventEmitter;`);
          expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);
        });
      });
    });
  });
});
