import * as ts from 'typescript';

interface ParsedContent {
  isReactComponent: boolean;
  hasExports: boolean;
  hasFunctions: boolean;
  componentName?: string;
  exportedFunctions: string[];
  props?: {
    name: string;
    type: string;
    required: boolean;
  }[];
}

export function parseFileContent(content: string): ParsedContent {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const parsed: ParsedContent = {
    isReactComponent: false,
    hasExports: false,
    hasFunctions: false,
    exportedFunctions: []
  };

  function visit(node: ts.Node) {
    // Handle function/const component declarations
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isIdentifier(declaration.name)) {
        const componentName = declaration.name.getText();
        // Check if it's exported and has React.FC or JSX.Element in type
        if (node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword) &&
            declaration.type?.getText().includes('React.FC')) {
          parsed.isReactComponent = true;
          parsed.componentName = componentName;
        }
      }
    }

    // Keep existing class component check
    if (ts.isClassDeclaration(node)) {
      if (node.heritageClauses?.some(clause => 
        clause.getText().includes('React.Component') || 
        clause.getText().includes('Component'))) {
        parsed.isReactComponent = true;
        parsed.componentName = node.name?.getText();
      }
    }

    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
      parsed.hasFunctions = true;
      if (node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        parsed.hasExports = true;
        if (ts.isFunctionDeclaration(node) && node.name) {
          parsed.exportedFunctions.push(node.name.getText());
        }
      }
    }

    if (ts.isInterfaceDeclaration(node)) {
      if (node.name.getText().endsWith('Props')) {
        parsed.props = node.members
          .map(member => {
            if (ts.isPropertySignature(member)) {
              return {
                name: member.name.getText(),
                type: member.type?.getText() || 'any',
                required: !member.questionToken
              };
            }
            return null;
          })
          .filter((prop): prop is { name: string; type: string; required: boolean } => prop !== null);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return parsed;
} 