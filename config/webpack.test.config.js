const path = require('path');
const constants = require('./shared');

module.exports = {
  entry: path.resolve(constants.TESTS_PATH, 'tests.js'),
  target: 'node',
  mode: 'production',
  output: {
    path: constants.TEMP_PATH,
    filename: 'testBundle.js',
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
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'cjs',
              },
            ],
          ],
          plugins: ['@babel/plugin-transform-flow-strip-types'],
        },
      },
    ],
  },
};
