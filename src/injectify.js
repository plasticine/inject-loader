import * as babylon from 'babylon';
import generate from 'babel-generator';
import traverse from 'babel-traverse';
import * as t from 'babel-types';

import wrapperTemplate from './wrapper_template.js';

function processRequireCall(path) {
  const dependencyString = path.node.arguments[0].value;
  path.replaceWith(t.logicalExpression('||',
        t.CallExpression(t.identifier('__getInjection'), [t.stringLiteral(dependencyString)]),
        path.node),
    );

  return dependencyString;
}

export default function injectify(context, source) {
  const ast = babylon.parse(source);

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
  const wrappedSourceAst = wrapperTemplate({ SOURCE: ast, DEPENDENCIES: dependenciesArrayAst });
  return generate(wrappedSourceAst, {});
}
