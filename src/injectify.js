// @flow

import {transform, traverse, types as t, transformFromAst} from 'babel-core';
import wrapperTemplate from './wrapper_template.js';

function processRequireCall(path) {
  const dependencyString = path.node.arguments[0].value;
  path.replaceWith(
    t.expressionStatement(
      t.conditionalExpression(
        t.callExpression(
          t.memberExpression(t.identifier('__injections'), t.identifier('hasOwnProperty'), false),
          [t.stringLiteral(dependencyString)]
        ),
        t.memberExpression(t.identifier('__injections'), t.stringLiteral(dependencyString), true),
        path.node
      )
    )
  );

  return dependencyString;
}

export default function injectify(
  context: Object,
  source: string,
  inputSourceMap: string,
  options: Object
) {
  const {ast} = transform(source, {
    babelrc: !!options.babelrc,
    code: false,
    compact: false,
    filename: context.resourcePath,
  });

  const dependencies = [];
  traverse(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, {name: 'require'})) {
        dependencies.push(processRequireCall(path));
        path.skip();
      }
    },
  });

  if (dependencies.length === 0) {
    context.emitWarning(
      "The module you are trying to inject into doesn't have any dependencies. " +
        'Are you sure you want to do this?'
    );
  }

  const wrapperModuleAst = t.file(
    t.program([
      wrapperTemplate({
        SOURCE: ast,
        SOURCE_PATH: t.stringLiteral(context.resourcePath),
        DEPENDENCIES: t.arrayExpression(dependencies.map(d => t.stringLiteral(d))),
      }),
    ])
  );

  return transformFromAst(wrapperModuleAst, source, {
    sourceMaps: context.sourceMap,
    sourceFileName: context.resourcePath,
    inputSourceMap,
    babelrc: !!options.babelrc,
    compact: false,
    filename: context.resourcePath,
  });
}
