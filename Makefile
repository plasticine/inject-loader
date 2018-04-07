integration-test:
	./script/integration_test

build:
	yarn run build
	mkdir -p ./dist
	cp -f ./tmp/index.js ./dist/index.js
	cp -f ./tmp/index.js.map ./dist/index.js.map
