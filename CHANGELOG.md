# Change log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

#### `4.0.1`

- Better error messages when module injections are invalid.

#### `4.0.0`

- Support Webpack 4.X

#### `3.0.0`

- [feature] Huge refactor & cleanup converting underlying implementation to use Babel Core. [#36](https://github.com/plasticine/inject-loader/pull/36)
  - This should fix a huge number of really annoying edge-cases that were present in the previous implementation, e.g [#32](https://github.com/plasticine/inject-loader/issues/32)
  - Support Sourcemaps! [#10](https://github.com/plasticine/inject-loader/issues/10)
  - Massive thanks to @vladimir-tikhonov for his stellar effots! 🚀👏

#### `2.0.1`

- [fixed] — Injection of Babel generated module code. [#11](https://github.com/plasticine/inject-loader/pull/11)

#### `2.0.0`

- [added] — Support for falling back to base module definition if an alternate is not defined; made this this default behaviour. [#7](https://github.com/plasticine/inject-loader/pull/11)

#### `1.0.0`

- Initial release.
