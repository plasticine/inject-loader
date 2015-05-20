var webpack = require('webpack');

module.exports = function (config) {
  config.set({
    browserNoActivityTimeout: 30000,
    browsers: [ process.env.CONTINUOUS_INTEGRATION ? 'Firefox' : 'Chrome' ],
    singleRun: process.env.CONTINUOUS_INTEGRATION === 'true',
    frameworks: [ 'mocha', 'sinon-chai' ],
    files: [ 'tests.webpack.js' ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'mocha' ],
    client: {
      mocha: {
        reporter: 'html',
        ui: 'bdd'
      }
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test')
        })
      ]
    },
    webpackServer: {
      noInfo: true
    }
  });
};
