const path = require('path');
const webpackBlocks = require('@webpack-blocks/webpack2');

const ROOT_PATH = path.resolve(__dirname, '..');
const SOURCE_PATH = path.resolve(ROOT_PATH, 'src');
const TESTS_PATH = path.resolve(ROOT_PATH, '__tests__');
const TEMP_PATH = path.resolve(ROOT_PATH, 'tmp');

const babelLoader = () => () => ({
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          SOURCE_PATH,
          TESTS_PATH,
        ],
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: ['es2015'],
        },
      },
    ],
  },
});

const nodeTarget = () => () => ({
  target: 'node',
});

const baseConfig = () => webpackBlocks.group([
  webpackBlocks.sourceMaps(),
  babelLoader(),
  nodeTarget(),
]);

module.exports = {
  baseConfig,
  SOURCE_PATH,
  TESTS_PATH,
  TEMP_PATH,
};
