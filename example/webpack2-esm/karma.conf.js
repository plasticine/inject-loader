const webpackConfig = require('./webpack.conf.js');

module.exports = function karmaConfig(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    files: [{pattern: 'test/*_test.js', watched: false}],

    preprocessors: {
      'test/*_test.js': ['webpack'],
    },
    client: {
      clearContext: false,
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['jsdom'],
    singleRun: true,
    concurrency: Infinity,
    webpack: webpackConfig,
  });
};
