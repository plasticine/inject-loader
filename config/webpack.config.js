const path = require('path');
const webpackBlocks = require('@webpack-blocks/webpack2');

const shared = require('./shared.js');

const NODE_EXTERNAL_DEPS = ['babel-core'];

const excludeNodeDepsFromCompilation = () => () => ({
  externals: NODE_EXTERNAL_DEPS.map(dep => ({
    [dep]: `commonjs ${dep}`,
  })),
});

module.exports = webpackBlocks.createConfig.vanilla([
  webpackBlocks.entryPoint(path.resolve(shared.SOURCE_PATH, 'index.js')),
  webpackBlocks.setOutput({
    path: shared.TEMP_PATH,
    filename: 'index.js',
    libraryTarget: 'commonjs-module',
  }),
  shared.baseConfig(),
  excludeNodeDepsFromCompilation(),
]);
