module.exports = {
  extends: ['airbnb-base'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
  },
  env: {
     mocha: true
  },
};
