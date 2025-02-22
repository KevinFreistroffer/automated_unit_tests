import * as fs from 'fs/promises';
import * as path from 'path';
import { parseFileContent } from './parser';

export async function generateTest(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');
  const parsedContent = await parseFileContent(content);
  
  if (!isTestable(parsedContent)) {
    return;
  }

  const testContent = generateTestContent(parsedContent, path.basename(filePath));
  const testPath = getTestFilePath(filePath);
  
  await fs.writeFile(testPath, testContent);
}

function isTestable(parsedContent: any): boolean {
  // Basic checks to determine if the file is testable
  return (
    parsedContent.isReactComponent ||
    parsedContent.hasExports ||
    parsedContent.hasFunctions
  );
}

function getTestFilePath(sourceFilePath: string): string {
  const dir = path.dirname(sourceFilePath);
  const basename = path.basename(sourceFilePath);
  const testName = basename.replace(/\.(js|ts|jsx|tsx)$/, '.test.$1');
  return path.join(dir, testName);
}

function generateTestContent(parsedContent: any, filename: string): string {
  // Remove the file extension for imports
  const baseFilename = filename.replace(/\.(tsx?|jsx?)$/, '');
  
  // Basic template for React component test
  if (parsedContent.isReactComponent) {
    return `
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${parsedContent.componentName} } from './${baseFilename}';

describe('${parsedContent.componentName}', () => {
  it('renders without crashing', () => {
    render(<${parsedContent.componentName} onClick={() => {}} />);
  });
});
`;
  }

  // Template for utility functions
  return `
import { ${parsedContent.exportedFunctions.join(', ')} } from './${filename}';

describe('${filename}', () => {
  ${parsedContent.exportedFunctions.map((fn: string) => `
  describe('${fn}', () => {
    it('should work correctly', () => {
      // Add test implementation
    });
  });
  `).join('\n')}
});
`;
} 