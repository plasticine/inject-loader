const path = require('path');
const webpackBlocks = require('@webpack-blocks/webpack2');

const shared = require('./shared.js');

const addSelfToLoaders = () => () => ({
  resolveLoader: {
    alias: {
      self: shared.TEMP_PATH,
    },
  },
});

module.exports = webpackBlocks.createConfig.vanilla([
  webpackBlocks.entryPoint(path.resolve(shared.TESTS_PATH, 'tests.js')),
  webpackBlocks.setOutput({
    path: shared.TEMP_PATH,
    filename: 'testBundle.js',
  }),
  shared.baseConfig(),
  addSelfToLoaders(),
]);
