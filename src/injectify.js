import { transform, traverse, types as t, transformFromAst } from 'babel-core';
import wrapperTemplate from './wrapper_template.js';

function processRequireCall(path) {
  const dependencyString = path.node.arguments[0].value;
  path.replaceWith(t.logicalExpression('||',
    t.CallExpression(t.identifier('__getInjection'), [t.stringLiteral(dependencyString)]),
    path.node),
  );

  return dependencyString;
}

export default function injectify(context, source, inputSourceMap) {
  const { ast } = transform(source, {
    babelrc: false,
    code: false,
    compact: false,
    filename: context.resourcePath,
  });

  const dependencies = [];
  traverse(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, { name: 'require' })) {
        dependencies.push(processRequireCall(path));
        path.skip();
      }
    },
  });

  if (dependencies.length === 0) {
    context.emitWarning('The module you are trying to inject into doesn\'t have any dependencies. ' +
      'Are you sure you want to do this?');
  }

  const dependenciesArrayAst = t.arrayExpression(
    dependencies.map(dependency => t.stringLiteral(dependency)),
  );
  const wrapperModuleAst = t.file(t.program([
    wrapperTemplate({ SOURCE: ast, DEPENDENCIES: dependenciesArrayAst, SOURCE_PATH: t.stringLiteral(context.resourcePath) }),
  ]));

  return transformFromAst(wrapperModuleAst, source, {
    sourceMaps: context.sourceMap,
    sourceFileName: context.resourcePath,
    inputSourceMap,
    babelrc: false,
    compact: false,
    filename: context.resourcePath,
  });
}
