inject = require('../index')
sinon = require('sinon')
expect = require('chai').expect

moduleFixture = """
  var Dispatcher = require('lib/dispatcher');
  var EventEmitter = require('events').EventEmitter;
  var handleAction = require('lib/handle_action');

  Dispatcher.register(handleAction, 'MyStore');
"""

describe 'inject-loader', ->
  before ->
    @context = cacheable: -> return
    @fn = inject.bind(@context)

  beforeEach ->
    @contextMock = sinon.mock(@context)

  it 'is cacheable', ->
    @contextMock.expects('cacheable').once()
    @fn('')
    @contextMock.verify()

  describe 'loader', ->
    describe 'injecting', ->
      it 'injects all require statements by default', ->
        src = "require('lib/thing')"
        replacement = "(injections.hasOwnProperty('lib/thing') ? injections['lib/thing'] : require('lib/thing'))"
        expect(@fn(src)).to.have.string replacement

    describe 'queries', ->
      describe 'empty', ->
        beforeEach ->
          @context.query = null

        it 'injects all modules', ->
          injectedSrc = @fn(moduleFixture)
          expect(injectedSrc).to.have.string "var Dispatcher = (injections.hasOwnProperty('lib/dispatcher') ? injections['lib/dispatcher'] : require('lib/dispatcher'));"
          expect(injectedSrc).to.have.string "var EventEmitter = (injections.hasOwnProperty('events') ? injections['events'] : require('events')).EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = (injections.hasOwnProperty('lib/handle_action') ? injections['lib/handle_action'] : require('lib/handle_action'));"

      describe 'single specific injection', ->
        beforeEach ->
          @context.query = '?lib/dispatcher'

        it 'only injects the module from the query', ->
          injectedSrc = @fn(moduleFixture)
          expect(injectedSrc).to.have.string "var Dispatcher = (injections.hasOwnProperty('lib/dispatcher') ? injections['lib/dispatcher'] : require('lib/dispatcher'));"
          expect(injectedSrc).to.have.string "var EventEmitter = require('events').EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = require('lib/handle_action');"

      describe 'multiple specific injections', ->
        beforeEach ->
          @context.query = '?lib/dispatcher&events'

        it 'injects all modules from the query', ->
          injectedSrc = @fn(moduleFixture)
          expect(injectedSrc).to.have.string "var Dispatcher = (injections.hasOwnProperty('lib/dispatcher') ? injections['lib/dispatcher'] : require('lib/dispatcher'));"
          expect(injectedSrc).to.have.string "var EventEmitter = (injections.hasOwnProperty('events') ? injections['events'] : require('events')).EventEmitter;"
          expect(injectedSrc).to.have.string "var handleAction = require('lib/handle_action');"

      describe 'exculde single specific injection', ->
        describe 'single exclusion flag', ->
          beforeEach ->
            @context.query = '?-lib/dispatcher'

          it 'injects all modules except the one from the query', ->
            injectedSrc = @fn(moduleFixture)
            expect(injectedSrc).to.have.string "var Dispatcher = require('lib/dispatcher');"
            expect(injectedSrc).to.have.string "var EventEmitter = (injections.hasOwnProperty('events') ? injections['events'] : require('events')).EventEmitter;"
            expect(injectedSrc).to.have.string "var handleAction = (injections.hasOwnProperty('lib/handle_action') ? injections['lib/handle_action'] : require('lib/handle_action'));"

        describe 'exculde multiple specific injections', ->
          beforeEach ->
            @context.query = '?-lib/dispatcher&-events'

          it 'injects all modules except the ones from the query', ->
            injectedSrc = @fn(moduleFixture)
            expect(injectedSrc).to.have.string "var Dispatcher = require('lib/dispatcher');"
            expect(injectedSrc).to.have.string "var EventEmitter = require('events').EventEmitter;"
            expect(injectedSrc).to.have.string "var handleAction = (injections.hasOwnProperty('lib/handle_action') ? injections['lib/handle_action'] : require('lib/handle_action'));"
