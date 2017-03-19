define((require) => { // eslint-disable-line no-undef
  const a = require('./a.js');
  const b = require('./b.js');

  return {
    getA() {
      return a.a();
    },

    getB() {
      return b();
    },

    callRequireMethod() {
      return a.require();
    },
  };
});
