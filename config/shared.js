const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '..');
const SOURCE_PATH = path.resolve(ROOT_PATH, 'src');
const TESTS_PATH = path.resolve(ROOT_PATH, '__tests__');
const TEMP_PATH = path.resolve(ROOT_PATH, 'tmp');
const NODE_EXTERNAL_DEPS = ['@babel/core'];

module.exports = {
  SOURCE_PATH,
  TESTS_PATH,
  TEMP_PATH,
  NODE_EXTERNAL_DEPS,
};
