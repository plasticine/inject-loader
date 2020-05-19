import assert from 'assert';
import moduleInjector from 'self!./modules/es6.js';

const MODULE_A_STUB = {
  a() {
    return 'a - stubbed';
  },
};

const MODULE_B_STUB = () => 'b - stubbed';

describe('inject-loader (ESM)', () => {
  it('works when no injections were provided', () => {
    const module = moduleInjector();

    assert.equal(module.getA(), 'a - original');
    assert.equal(module.getB(), 'b - original');
    assert.equal(module.getC(), 'c - original');
  });

  it('works when one injection was provided', () => {
    const module = moduleInjector({
      './a.js': MODULE_A_STUB,
    });

    assert.equal(module.getA(), 'a - stubbed');
    assert.equal(module.getB(), 'b - original');
    assert.equal(module.getC(), 'c - original');
  });

  it('works when a falsey injection was provided', () => {
    const module = moduleInjector({
      './c.js': undefined,
    });

    assert.equal(module.getA(), 'a - original');
    assert.equal(module.getB(), 'b - original');
    assert.equal(module.getC(), undefined);
  });

  it('works when multiple injections were provided', () => {
    const module = moduleInjector({
      './a.js': MODULE_A_STUB,
      './b.js': MODULE_B_STUB,
    });

    assert.equal(module.getA(), 'a - stubbed');
    assert.equal(module.getB(), 'b - stubbed');
    assert.equal(module.getC(), 'c - original');
  });

  it('throws an error when invalid dependencies are provided', () => {
    const injectInvalidDependencies = () => {
      moduleInjector({
        './b.js': null,
        './d.js': null,
      });
    };

    assert.throws(injectInvalidDependencies, /Injection Error in/);
    assert.throws(
      injectInvalidDependencies,
      /The following injections are invalid:\n - \.\/d\.js\n/
    );
    assert.throws(
      injectInvalidDependencies,
      /The following injections were passed in:\n - \.\/b\.js\n - \.\/d\.js\n/
    );
    assert.throws(
      injectInvalidDependencies,
      /Valid injection targets for this module are:\n - \.\/a\.js\n - \.\/b\.js\n - \.\/c\.js/
    );
  });

  it('does not break someObject.require calls', () => {
    const module = moduleInjector();

    assert.equal(module.callRequireMethod(), 'require method in a.js');
  });
});
