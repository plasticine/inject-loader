const path = require('path');
const constants = require('./shared');

module.exports = {
  entry: path.resolve(constants.TESTS_PATH, 'tests.esm.js'),
  target: 'node',
  mode: 'production',
  output: {
    path: constants.TEMP_PATH,
    filename: 'testBundleESM.js',
  },
  resolveLoader: {
    alias: {
      self: constants.TEMP_PATH,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [constants.SOURCE_PATH, constants.TESTS_PATH],
        query: {
          cacheDirectory: true,
          presets: [['es2015', {modules: false}]],
          plugins: ['transform-flow-strip-types'],
        },
      },
    ],
  },
};
