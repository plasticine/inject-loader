define((require) => { // eslint-disable-line no-undef
  const a = require('./a.js');
  const b = require('./b.js');
  const c = require('./c.js');

  return {
    getA() {
      return a.a();
    },

    getB() {
      return b();
    },

    getC() {
      return c;
    },

    callRequireMethod() {
      return a.require();
    },
  };
});
