import inject from '../src';
import sinon from 'sinon';
import {expect} from 'chai';

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
});
