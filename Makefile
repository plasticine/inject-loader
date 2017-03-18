lint:
	npm run eslint

test:
	npm run build
	npm run build-test
	npm run test

integration-test:
	./script/integration_test

build-release:
	npm run build-prod
	cp -f ./tmp/index.js ./dist/index.js
