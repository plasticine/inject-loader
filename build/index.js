var fs = require('fs');
var path = require('path');

var pkg = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, '..', 'package.json'),
		'utf-8'
	)
);

var whiteListProdKeys = [
	'author',
	'bin',
	'bugs',
	'contributors',
	'cpu',
	'dependencies',
	'description',
	'files',
	'homepage',
	'keywords',
	'license',
	'main',
	'man',
	'name',
	'os',
	'peerDependencies',
	'repository',
	'version',
];

Object.keys(pkg).forEach(function(key) {
	if (whiteListProdKeys.indexOf(key) === -1) {
		delete pkg[key];
	}
});

if (typeof pkg.name !== 'string' || pkg.name.indexOf('@tradingview/') !== 0) {
	throw new Error('The `name` of package must be started with `@tradingview/`');
}

// private is used to prevent publishing
pkg.private = true;

var distDirectory = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDirectory)) {
	fs.mkdirSync(distDirectory);
}

fs.writeFileSync(
	path.resolve(distDirectory, 'package.json'),
	JSON.stringify(pkg, null, 2)
);
