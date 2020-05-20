// @flow

import {template} from '@babel/core';

export default template(
  `
    export default function __injector(__injections) {
        __injections = __injections || {};

        (function __validateInjection() {
        var validDependencies = DEPENDENCIES;
        var injectedDependencies = Object.keys(__injections);
        var invalidInjectedDependencies = injectedDependencies.filter(function (dependency) {
            return validDependencies.indexOf(dependency) === -1;
        });

        if (invalidInjectedDependencies.length > 0) {
            var validDependenciesString = ' - ' + validDependencies.join('\\n - ');
            var injectedDependenciesString = ' - ' + injectedDependencies.join('\\n - ');
            var invalidDependenciesString = ' - ' + invalidInjectedDependencies.join('\\n - ');

            throw new Error('Injection Error in ' + SOURCE_PATH + '\\n\\n' +
            'The following injections are invalid:\\n' + invalidDependenciesString + '\\n\\n' +
            'The following injections were passed in:\\n' + injectedDependenciesString + '\\n\\n' +
            'Valid injection targets for this module are:\\n' + validDependenciesString + '\\n'
            );
        }
        })();

        __injector.sourcePath = SOURCE_PATH;
        __injector.validDependencies = DEPENDENCIES;

        var module = { exports: {} };
        var exports = module.exports;

        (function () {
        SOURCE
        })();

        if (module.exports.hasOwnProperty('default') && Object.keys(module.exports).length === 1) {
            module.exports = module.exports.default;
        }

        return module.exports;
    }
`,
  {
    sourceType: 'module',
  }
);
