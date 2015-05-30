import inject from '../index';

const commonjsModuleFixture = `
  var Dispatcher = require('lib/dispatcher');
  var EventEmitter = require('events').EventEmitter;
  var handleAction = require('lib/handle_action');

  Dispatcher.register(handleAction, 'MyStore');
`;

function makeStubbedInjectorFn(src) {
  return Function(`
    return function wrappedInjectorFn(requireStub, injections) {
      var require = requireStub;
      var module = {};
      ${src}(injections);
    }
  `)();
}

describe('inject-loader', function() {
  before(() => {
    this.context = {
      cacheable: () => { return; }
    };
    this.injectLoaderFn = inject.bind(this.context);
  });

  beforeEach(() => {
    this.contextMock = sinon.mock(this.context);
  });

  it('is cacheable', () => {
    this.contextMock.expects('cacheable').once();
    this.injectLoaderFn('');
    this.contextMock.verify();
  });

  describe('injecting code into a module via its dependencies', () => {
    it('injects all dependencies by default', () => {
      const src = `require('lib/thing')`;
      const replacement = `(__injections__['lib/thing'] || require('lib/thing'))`;
      chai.expect(this.injectLoaderFn(src)).to.have.string(replacement);
    });

    xit('falls back to the original dependency when a replacement is not provided', () => {
      return;
    });

    xit('throws an error if not provided with any injections', () => {
      return;
    });

    it('allows code to be injected into the module via the injector function', () => {
      const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
    });

    describe('controlling injection targets via loader query', () => {
      describe('no query', () => {
        beforeEach(() => {
          this.context.query = null;
        });

        it('provides an injector for all module dependencies', () => {
          const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
          chai.expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          chai.expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          chai.expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);

          // const requireStub = sinon.stub();
          // requireStub.withArgs('lib/dispatcher').returns(sinon.stub({register: () => true}))
          // requireStub.withArgs('events').returns(sinon.stub({EventEmitter: () => true}))
          // requireStub.withArgs('lib/handle_action').returns(sinon.stub())
          // makeStubbedInjectorFn(moduleInjectorFn)(requireStub);
          // sinon.assert.calledThrice(requireStub);
        });
      });

      describe('single specific injection', () => {
        beforeEach(() => {
          this.context.query = '?lib/dispatcher';
        });

        it('only injects the specified dependency', () => {
          const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
          chai.expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          chai.expect(moduleInjectorFn).to.have.string(`var EventEmitter = require('events').EventEmitter;`);
          chai.expect(moduleInjectorFn).to.have.string(`var handleAction = require('lib/handle_action');`);
        });

        xit('throws an error if the specified dependency is not valid', () => {
          return;
        });
      });

      describe('multiple specific injection', () => {
        beforeEach(() => {
          this.context.query = '?lib/dispatcher&events';
        });

        it('injects all modules from the query', () => {
          const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
          chai.expect(moduleInjectorFn).to.have.string(`var Dispatcher = (__injections__['lib/dispatcher'] || require('lib/dispatcher'));`);
          chai.expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          chai.expect(moduleInjectorFn).to.have.string(`var handleAction = require('lib/handle_action');`);
        });

        xit('throws an error if any of the specified dependencies are not valid', () => {
          return;
        });
      });

      describe('exculde single specific injection', () => {
        beforeEach(() => {
          this.context.query = '?-lib/dispatcher';
        });

        it('injects all modules except the one from the query', () => {
          const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
          chai.expect(moduleInjectorFn).to.have.string(`var Dispatcher = require('lib/dispatcher');`);
          chai.expect(moduleInjectorFn).to.have.string(`var EventEmitter = (__injections__['events'] || require('events')).EventEmitter;`);
          chai.expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);
        });

        xit('throws an error if the specified dependency exclusion is not valid', () => {
          return;
        });
      });

      describe('exculde multiple specific injections', () => {
        beforeEach(() => {
          this.context.query = '?-lib/dispatcher&-events';
        });

        it('injects all modules except the ones from the query', () => {
          const moduleInjectorFn = this.injectLoaderFn(commonjsModuleFixture);
          chai.expect(moduleInjectorFn).to.have.string(`var Dispatcher = require('lib/dispatcher');`);
          chai.expect(moduleInjectorFn).to.have.string(`var EventEmitter = require('events').EventEmitter;`);
          chai.expect(moduleInjectorFn).to.have.string(`var handleAction = (__injections__['lib/handle_action'] || require('lib/handle_action'));`);
        });

        xit('throws an error if any of the specified dependeny exclusions are not valid', () => {
          return;
        });
      });
    });
  });
});
