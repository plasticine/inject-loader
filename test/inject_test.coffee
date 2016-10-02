inject = require('../lib')
sinon = require('sinon')
expect = require('chai').expect

source = """
  var Dispatcher = require('lib/dispatcher'); var Herp = require('Derp');
  var EventEmitter = require('events').EventEmitter;
  const emitter = new EventEmitter();

  if (something)
    var handleAction = require('lib/handle_action');

  Dispatcher.register(handleAction, 'MyStore');
"""

describe 'inject-loader', ->
  before ->
    @context =
      cacheable: -> return
    @injectFn = inject.bind(@context)

  beforeEach ->
    @contextMock = sinon.mock(@context)

  it 'is cacheable', ->
    @contextMock.expects('cacheable').once()
    @injectFn('require("foo")')
    @contextMock.verify()

  describe 'loader', ->
    describe 'injecting', ->
      it 'injects all require statements by default', ->
        src = "require('lib/thing')"
        expect(@injectFn(src)).to.have.string "__injectRequire('lib/thing')"

      it 'provides export variable to support use with CJS and Babel', ->
        src = "require('lib/thing')"
        expect(@injectFn(src)).to.have.string "var module = { exports: {} };"
        expect(@injectFn(src)).to.have.string "var exports = module.exports;"

      it 'returns the wrapped module exports', ->
        src = "require('lib/thing')"
        expect(@injectFn(src)).to.have.string "return module.exports;"

      it 'returns a injector function that can inject dependencies', ->
        src = "require('someModule')('foobar');"
        someModuleStub = sinon.stub()
        eval(@injectFn(src))
        injectWrapper({'someModule': someModuleStub})
        sinon.assert.calledOnce(someModuleStub)
        sinon.assert.calledWithExactly(someModuleStub, 'foobar')

      it '...', ->
        consoleWarnStub = sinon.stub(console, 'warn');
        @context.resourcePath = 'my/sillyModule.js'
        src = "var sillyCode = true;"
        someModuleStub = sinon.stub()
        eval(@injectFn(src))
        sinon.assert.calledOnce(consoleWarnStub)
        sinon.assert.calledWithExactly(consoleWarnStub, 'Inject Loader: The module you are trying to inject into (`my/sillyModule.js`) does not seem to have any dependencies, are you sure you want to do this?')
        consoleWarnStub.restore()

      it 'throws an error if the user tries to specify an injection that doesnt exist', ->
        src = "require('someModule')('foobar');"
        someModuleStub = sinon.stub()
        eval(@injectFn(src))
        expect(=>
          injectWrapper({someModule: someModuleStub, derp: sinon.stub()})
        ).to.throw(Error, /One or more of the injections you passed in is invalid for the module you are attempting to inject into/);

    describe 'queries', ->
      describe 'empty', ->
        beforeEach ->
          @context.query = null

        it 'injects all modules', ->
          injectedSrc = @injectFn(source)
          expect(injectedSrc).to.have.string "var Dispatcher = __injectRequire('lib/dispatcher');"
          expect(injectedSrc).to.have.string "var EventEmitter = __injectRequire('events').EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = __injectRequire('lib/handle_action');"

      describe 'single specific injection', ->
        beforeEach ->
          @context.query = '?lib/dispatcher'

        it 'only injects the module from the query', ->
          injectedSrc = @injectFn(source)
          expect(injectedSrc).to.have.string "var Dispatcher = __injectRequire('lib/dispatcher');"
          expect(injectedSrc).to.have.string "var EventEmitter = require('events').EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = require('lib/handle_action');"

      describe 'multiple specific injections', ->
        beforeEach ->
          @context.query = '?lib/dispatcher&events'

        it 'injects all modules from the query', ->
          injectedSrc = @injectFn(source)
          expect(injectedSrc).to.have.string "var Dispatcher = __injectRequire('lib/dispatcher');"
          expect(injectedSrc).to.have.string "var EventEmitter = __injectRequire('events').EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = require('lib/handle_action');"

      describe 'exculde single specific injection', ->
        describe 'single exclusion flag', ->
          beforeEach ->
            @context.query = '?-lib/dispatcher'

          it 'injects all modules except the one from the query', ->
            injectedSrc = @injectFn(source)
            expect(injectedSrc).to.have.string "var Dispatcher = require('lib/dispatcher');"
            expect(injectedSrc).to.have.string "var EventEmitter = __injectRequire('events').EventEmitter;"
            expect(injectedSrc).to.have.string "var handleAction = __injectRequire('lib/handle_action');"

        describe 'exculde multiple specific injections', ->
          beforeEach ->
            @context.query = '?-lib/dispatcher&-events'

          it 'injects all modules except the ones from the query', ->
            injectedSrc = @injectFn(source)
            expect(injectedSrc).to.have.string "var Dispatcher = require('lib/dispatcher');"
            expect(injectedSrc).to.have.string "var EventEmitter = require('events').EventEmitter;"
            expect(injectedSrc).to.have.string "var handleAction = __injectRequire('lib/handle_action');"
