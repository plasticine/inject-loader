// @flow

import {template} from 'babel-core';

export default template(`
  module.exports = function __injector(__injections) {
    __injections = __injections || {};

    (function __validateInjection() {
      var validDependencies = DEPENDENCIES;
      var injectedDependencies = Object.keys(__injections);
      var invalidInjectedDependencies = injectedDependencies.filter(function (dependency) {
        return validDependencies.indexOf(dependency) === -1;
      });

      if (invalidInjectedDependencies.length > 0) {
        var validDependenciesString = '- ' + validDependencies.join('\\n- ');
        var injectedDependenciesString = '- ' + injectedDependencies.join('\\n- ');
        var invalidDependenciesString = '- ' + invalidInjectedDependencies.join('\\n- ');

        throw new Error('Some of the injections you passed in are invalid.\\n' +
          'Valid injection targets for this module are:\\n' + validDependenciesString + '\\n' +
          'The following injections were passed in:\\n' + injectedDependenciesString + '\\n' +
          'The following injections are invalid:\\n' + invalidDependenciesString + '\\n'
        );
      }
    })();

    var module = { exports: {} };
    var exports = module.exports;

    (function () {
      SOURCE
    })();

    return module.exports;
  }
`);
