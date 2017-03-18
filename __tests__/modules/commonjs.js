const a = require('./a.js');
const b = require('./b.js');

module.exports = {
  getA() {
    return a.a();
  },

  getB() {
    return b();
  },
};
