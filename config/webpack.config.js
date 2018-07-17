const path = require('path');
const constants = require('./shared');

module.exports = {
  entry: path.resolve(constants.SOURCE_PATH, 'index.js'),
  target: 'node',
  mode: 'production',
  output: {
    path: constants.TEMP_PATH,
    filename: 'index.js',
    library: 'InjectLoader',
    libraryTarget: 'commonjs-module',
  },
  externals: constants.NODE_EXTERNAL_DEPS.map(dep => ({
    [dep]: `commonjs ${dep}`,
  })),
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [constants.SOURCE_PATH, constants.TESTS_PATH],
        query: {
          cacheDirectory: true,
          presets: ['latest'],
          plugins: ['add-module-exports', 'transform-flow-strip-types'],
        },
      },
    ],
  },
};
