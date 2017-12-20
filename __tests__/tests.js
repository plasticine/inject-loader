/* eslint-disable global-require */

const assert = require('assert');

const MODULE_A_STUB = {
  a() {
    return 'a - stubbed';
  },
};

const MODULE_B_STUB = () => 'b - stubbed';

describe('inject-loader', () => {
  const injectors = [
        { moduleType: 'commonjs', moduleInjector: require('self!./modules/commonjs.js') },
        { moduleType: 'amd', moduleInjector: require('self!./modules/amd.js') },
        { moduleType: 'es6', moduleInjector: require('self!./modules/es6.js') },
  ];

  injectors.forEach((injector) => {
    describe(`${injector.moduleType} modules`, () => {
      it('works when no injections were provided', () => {
        const module = injector.moduleInjector();

        assert.equal(module.getA(), 'a - original');
        assert.equal(module.getB(), 'b - original');
        assert.equal(module.getC(), 'c - original');
      });

      it('works when one injection was provided', () => {
        const module = injector.moduleInjector({
          './a.js': MODULE_A_STUB,
        });

        assert.equal(module.getA(), 'a - stubbed');
        assert.equal(module.getB(), 'b - original');
        assert.equal(module.getC(), 'c - original');
      });

      it('works when a falsey injection was provided', () => {
        const module = injector.moduleInjector({
          './c.js': undefined,
        });

        assert.equal(module.getA(), 'a - original');
        assert.equal(module.getB(), 'b - original');
        assert.equal(module.getC(), undefined);
      });

      it('works when multiple injections were provided', () => {
        const module = injector.moduleInjector({
          './a.js': MODULE_A_STUB,
          './b.js': MODULE_B_STUB,
        });

        assert.equal(module.getA(), 'a - stubbed');
        assert.equal(module.getB(), 'b - stubbed');
        assert.equal(module.getC(), 'c - original');
      });

      it('throws an error when invalid dependencies are provided', () => {
        const injectInvalidDependencies = () => {
          injector.moduleInjector({
            './b.js': null,
            './d.js': null,
          });
        };

        assert.throws(injectInvalidDependencies, /The following injections are invalid:\n- \.\/d\.js/);
      });

      it('does not break someObject.require calls', () => {
        const module = injector.moduleInjector();

        assert.equal(module.callRequireMethod(), 'require method in a.js');
      });
    });
  });
});
