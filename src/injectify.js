// @flow

import {transformSync, traverse, types as t, transformFromAstSync} from '@babel/core';
import wrapperTemplate from './wrapper_template.js';
import wrapperTemplateESM from './wrapper_template_esm.js';

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

function processImport(path) {
  const node = path.node;
  const dependencyString = node.source.value;

  const injectionStatements = [];
  const aliasedSpecifiers = node.specifiers.map(specifier => {
    const localIdentifier = specifier.local;
    const importedIdentifier = specifier.imported;
    // ex: __React
    const aliasIdentifier = t.identifier(`__${localIdentifier.name}`);

    // __injections['react']
    let injectionExpression = t.memberExpression(
      t.identifier('__injections'),
      t.stringLiteral(dependencyString),
      true
    );
    if (specifier.type === 'ImportSpecifier') {
      // __injections['react'].Component
      injectionExpression = t.memberExpression(injectionExpression, importedIdentifier);
    }

    injectionStatements.push(
      t.variableDeclaration('var', [
        t.variableDeclarator(
          localIdentifier,
          t.conditionalExpression(
            t.callExpression(
              t.memberExpression(
                t.identifier('__injections'),
                t.identifier('hasOwnProperty'),
                false
              ),
              [t.stringLiteral(dependencyString)]
            ),
            injectionExpression,
            aliasIdentifier
          )
        ),
      ])
    );

    specifier.local = aliasIdentifier;
    return specifier;
  });

  const aliasedImport = t.importDeclaration(aliasedSpecifiers, node.source);

  path.replaceWithMultiple(injectionStatements);

  return {
    node: aliasedImport,
    dependencyString,
  };
}

function processDynamicImport(path) {
  const dependencyString = path.node.arguments[0].value;

  path.replaceWith(
    t.expressionStatement(
      t.conditionalExpression(
        t.callExpression(
          t.memberExpression(t.identifier('__injections'), t.identifier('hasOwnProperty'), false),
          [t.stringLiteral(dependencyString)]
        ),
        t.callExpression(
          t.memberExpression(t.identifier('Promise'), t.identifier('resolve'), false),
          [
            t.memberExpression(
              t.identifier('__injections'),
              t.stringLiteral(dependencyString),
              true
            ),
          ]
        ),
        path.node
      )
    )
  );

  return dependencyString;
}

// module.exports[exportIdentifier] = localIdentifier
function createExportAssignment(exportIdentifier, localIdentifier) {
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        t.memberExpression(t.identifier('module'), t.identifier('exports'), false),
        exportIdentifier,
        false
      ),
      localIdentifier
    )
  );
}

function processDefaultExport(path) {
  let exportAssignment;
  const declaration = path.node.declaration;

  if (declaration.type === 'FunctionDeclaration') {
    exportAssignment = createExportAssignment(
      t.identifier('default'),
      t.functionExpression(
        declaration.id,
        declaration.params,
        declaration.body,
        declaration.generator,
        declaration.async
      )
    );
  } else {
    exportAssignment = createExportAssignment(t.identifier('default'), path.node.declaration);
  }

  path.replaceWith(exportAssignment);
}

function processExport(path) {
  let statements = [];

  const declaration = path.node.declaration;
  if (declaration) {
    statements.push(declaration);

    if (Array.isArray(declaration.declarations)) {
      declaration.declarations.forEach(d => {
        let isLiteral = false;
        if (d.init && d.init.type.endsWith('Literal')) {
          isLiteral = true;
        }
        statements.push(createExportAssignment(d.id, isLiteral ? d.init : d.id));
      });
    } else {
      statements.push(createExportAssignment(declaration.id, declaration.id));
    }
  } else {
    statements = path.node.specifiers.map(specifier =>
      createExportAssignment(specifier.exported, specifier.local)
    );
  }

  path.replaceWithMultiple(statements);
}

export default function injectify(context: Object, source: string, inputSourceMap: string) {
  const {ast} = transformSync(source, {
    ast: true,
    code: false,
    compact: false,
    filename: context.resourcePath,
  });

  const dependencies = [];
  const imports = [];
  let usesESModules = false;

  traverse(ast, {
    CallExpression(path) {
      if (
        t.isIdentifier(path.node.callee, {
          name: 'require',
        })
      ) {
        dependencies.push(processRequireCall(path));
        path.skip();
      } else if (t.isImport(path.node.callee)) {
        dependencies.push(processDynamicImport(path));
        path.skip();
      }
    },
    ImportDeclaration(path) {
      usesESModules = true;
      const {node, dependencyString} = processImport(path);
      imports.push(node);
      dependencies.push(dependencyString);
      path.skip();
    },
    ExportDefaultDeclaration(path) {
      usesESModules = true;
      processDefaultExport(path);
      path.skip();
    },
    ExportNamedDeclaration(path) {
      usesESModules = true;
      processExport(path);
      path.skip();
    },
  });

  if (dependencies.length === 0) {
    context.emitWarning(
      "The module you are trying to inject into doesn't have any dependencies. " +
        'Are you sure you want to do this?'
    );
  }

  const template = usesESModules ? wrapperTemplateESM : wrapperTemplate;

  const wrapperModuleAst = t.file(
    t.program([
      ...imports,
      template({
        SOURCE: ast.program.body,
        SOURCE_PATH: t.stringLiteral(context.resourcePath),
        DEPENDENCIES: t.arrayExpression(dependencies.map(d => t.stringLiteral(d))),
      }),
    ]),
    []
  );

  return transformFromAstSync(wrapperModuleAst, source, {
    sourceMaps: context.sourceMap,
    sourceFileName: context.resourcePath,
    inputSourceMap: inputSourceMap || undefined,
    babelrc: false,
    compact: false,
    configFile: false,
    filename: context.resourcePath,
  });
}
