#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
// import * as stylelint from 'stylelint';

/** Parse the command line */
const args = process.argv.slice(2);

// Validate input
if (args.length > 1) {
  console.log("Warning: Accommodates at most one argument (full path to desired root dir)");
  process.exit();
}

const src: string | undefined = args[0];
// const target = args[1];
const dirSrc = path.dirname(src);
console.log('dirsrc', dirSrc)

if (!fs.existsSync(src)) {
  console.log("Error: Source file doesn't exist. Given: ", src);
  process.exit();
}

interface IMessage {
  ruleId: number;
  severity: number;
  line: number;
  column: number;
  message: string;
}

interface IFile {
  messages: IMessage[];
  filePath: string;
}

type LinesRecord =  Record<'js_lines' | 'ts_lines' | 'css_lines' | 'other_style_lines', number>;
type FileCounterRecord =  Record<'.js' | '.jsx' | '.ts' | '.tsx' | '.md' | '.css' | '.scss' | '.sass' | '.less' | '.py' | 'other_style_files', number>;
type FileContentRecord =  Record<'!important' | '= useRef' | 'style={' | 'margin:' | '= React.useRef' | '.subscribe(', number>;
type Issues =  Record<'strict_mode', number>; // TODO: 'styleLint'

interface ICounter {
  fileCounter: FileCounterRecord;
  filesLinesCounter: LinesRecord;
  filesContentCounter: FileContentRecord;
  problemIssues: Issues;
}


const fileCounter: FileCounterRecord = {
  '.js': 0,
  '.jsx': 0,
  '.ts': 0,
  '.tsx': 0,
  '.md': 0,
  '.css': 0,
  '.scss': 0,
  '.sass': 0,
  '.less': 0,
  '.py': 0,
  'other_style_files': 0
}

const filesLinesCounter: LinesRecord = {
  js_lines: 0,
  ts_lines: 0,
  css_lines: 0,
  other_style_lines: 0
}

const filesContentCounter: FileContentRecord = {
  '!important': 0,
  '= useRef': 0,
  '= React.useRef': 0,
  'style={': 0,
  'margin:': 0,
  '.subscribe(': 0,
}

const problemIssues: Issues = {
  strict_mode: 0,
  // styleLint: 0
}

const fileCounterKeys = Object.keys(fileCounter);

let ROOT_DIR = '.';

let markdownContent: string = '# JS / TS Repo Analysis Report\n\n';
const styleRegex = /\.style\.(js|jsx|ts|tsx)$/;

// function checkStyleLint(filePath: string): number {
//   const result = stylelint.lint({ files: filePath, formatter: 'string' });
//
//   if (result.errored) {
//     return result.output.split('\n').length - 1; // Subtract 1 for the final newline
//   }
//
//   return 0;
// }

/**
 * Counts the number of strict mode problemIssues.
 * @param filePath
 */
function checkStrictMode(filePath: string): number {
  try {
    const sourceFile = ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );

    if (!sourceFile) {
      console.error(`Failed to create source file for ${filePath}`);
      return 0;
    }

    const program = ts.createProgram([filePath], {});
    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);

    return diagnostics.filter(({ category, code }) => category === ts.DiagnosticCategory.Error && code >= 2300 && code <= 2700).length;
  } catch (error) {
    console.error(`Error checking Strict Mode for ${filePath}: ${error}`);
    return 0;
  }
}

/**
 * Counts number of non-empty lines in a file.
 * @param filePath
 */
function countNonEmptyLines(filePath: string): number {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  let lineCount = 0;

  for (const line of lines) {
    if (line.trim() !== '') {
      lineCount++;
    }
  }

  return lineCount;
}

/**
 * Counts occurrences of certain code uses that should be minimized
 * Currently counted: !importants, useRefs, inline styles, margins, and RxJS subscriptions
 * @param filePath
 * @param counter
 */
function countOccurrencesToMinimize(filePath: string, counter: Record<string, number>) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  for (const line of lines) {
    for (const key in counter) {
      if (line.includes(key)) {
        counter[key]++;
      }
    }
  }
}

function traverseDirectory(currentPath: string): void {
  const fileNames: string[] = fs.readdirSync(currentPath);

  fileNames.forEach((file: string) => {
    const fullPath: string = path.join(currentPath, file);
    const stats = fs.statSync(fullPath);
    const extension = path.extname(file) as keyof Omit<FileCounterRecord, 'other_style_files'>;

    if (fullPath.includes('node_modules') || fullPath.includes('dist') || fullPath.includes('build')) {
      return;
    } else if (stats.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (stats.isFile() && fileCounterKeys.includes(extension)) {
      fileCounter[extension]++;

      if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
        problemIssues.strict_mode += checkStrictMode(fullPath);
      }

      // if (['.css', '.scss', '.sass', '.less'].includes(extension)) {
      //   problemIssues.styleLint += checkStyleLint(fullPath);
      // }

      // Count lines
      if (['.js', '.jsx'].includes(extension)) {
        filesLinesCounter.js_lines += countNonEmptyLines(fullPath);
      } else if (['.ts', '.tsx'].includes(extension)) {
        filesLinesCounter.ts_lines += countNonEmptyLines(fullPath);
      } else if (['.css', '.scss', '.sass', '.less'].includes(extension)) {
        filesLinesCounter.css_lines += countNonEmptyLines(fullPath);
      }

      // count instances of unwanted occurrences
      countOccurrencesToMinimize(fullPath, filesContentCounter);
    }

    if (fullPath.match(styleRegex)) {
      fileCounter.other_style_files++
      filesLinesCounter.other_style_lines += countNonEmptyLines(fullPath);
    }
  });
}

function traverseFilesAndFoldersForIssues(directoryPath: string): void {
  console.log('Traverse Files and Folders...');
  traverseDirectory(directoryPath);

  formatFileIssuesToMarkdown({ fileCounter, filesLinesCounter, filesContentCounter, problemIssues })
}

/**
 * Formats the ESLint results, and adds it to the markdown file
 * @param eslintJson
 */
function formatEslintOutputToMarkdown(eslintJson: string): void {
  try {
    const parsedOutput: Array<IFile> = JSON.parse(eslintJson);

    markdownContent += '## ESLint Summary\n\n';
    const totalFiles = parsedOutput.length;
    const filesWithIssues = parsedOutput.filter((file) => file.messages.length > 0).length;
    const totalIssues = parsedOutput.reduce((sum, file) => sum + file.messages.length, 0);

    markdownContent += `- **Total Files Analyzed**: ${totalFiles}\n`;
    markdownContent += `- **Files with Issues**: ${filesWithIssues}\n`;
    markdownContent += `- **Total Issues**: ${totalIssues}\n\n`;
  } catch (error) {
    console.error('Error formatting ESLint output:', error);
    markdownContent += '## ESLint Analysis Report\n\nError parsing ESLint output.\n\n';
  }
}

/**
 * Formats the code quality results, and adds it to the markdown file
 * @param codeQualityJson
 */
function formatFileIssuesToMarkdown(codeQualityJson: ICounter): void {
  try {
    const { fileCounter, filesLinesCounter, filesContentCounter, problemIssues } = codeQualityJson

    markdownContent += '## Code Quality Summary\n\n';

    markdownContent += '### File Counts\n\n';
    // js
    markdownContent += `- **Total .js & .jsx Files**: ${fileCounter['.jsx'] + fileCounter['.js']}\n`;
    markdownContent += `- **Total .js & .jsx File Lines**: ${filesLinesCounter.js_lines}\n`;
    // ts
    markdownContent += `- **Total .ts & .tsx Files**: ${fileCounter['.tsx'] + fileCounter['.ts']}\n`;
    markdownContent += `- **Total .ts & .tsx File Lines**: ${filesLinesCounter.ts_lines}\n`;
    // css, sass, scss, less
    markdownContent += `- **Total Styling Files**: ${fileCounter['.css'] + fileCounter['.less'] + fileCounter['.sass'] + fileCounter['.scss']}\n`;
    markdownContent += `- **Total Styling Lines**: ${filesLinesCounter.css_lines}\n`;
    // other styling
    markdownContent += `- **Total Other Styling Files**: ${fileCounter.other_style_files}\n`;
    markdownContent += `- **Total Other Styling Lines**: ${filesLinesCounter.other_style_lines}\n\n`;


    markdownContent += '### General Issues Count\n\n';
    // "!important"s
    markdownContent += `- **Total !important Counts**: ${filesContentCounter['!important']}\n`;
    // Ref Counts
    markdownContent += `- **Total Ref Counts**: ${filesContentCounter['= useRef'] + filesContentCounter['= React.useRef']}\n`;
    // Margin Counts
    markdownContent += `- **Total Margin Counts**: ${filesContentCounter['margin:']}\n`;
    // RxJS Subscriptions
    markdownContent += `- **Total RxJS Subscriptions**: ${filesContentCounter['.subscribe(']}\n`;
    // Inline Styles
    markdownContent += `- **Total Inline Styles**: ${filesContentCounter['style={']}\n`;
    // Strict Mode Issues
    markdownContent += `- **Total Files with Strict Mode Issues**: ${problemIssues.strict_mode}\n\n`;
    // Style Lint Issues - TODO

  } catch (error) {
    console.error('Error formatting Code Quality output:', error);
    markdownContent += '## Code Quality Analysis Report\n\nError parsing Code Quality output.\n\n';
  }
}

/**
 * Runs eslint on the repo and adds results to the markdown results report.
 */
function eslintReporter(): void {
  try {
    console.log('Running ESLint...');
    const eslintOutput: string = execSync(`cd ${ROOT_DIR} && npx eslint . --format json `, { encoding: 'utf-8' });

    formatEslintOutputToMarkdown(eslintOutput);
  } catch (error: any) {
    console.log('No ESLint config found.');
    try {
      console.log('Re-Running ESLint...');
      const eslintOutput: string = execSync(`cd ${ROOT_DIR} && touch .eslintrc && npx eslint . --format json --config .eslintrc`, { encoding: 'utf-8' });

      formatEslintOutputToMarkdown(eslintOutput);
    } catch (error: any) {
      console.error('An error occurred:', error.message);
      process.exit(1);
    }
  }
}

/**
 * Traverses all the files and folders recursively to check the current folder, and outputs a report on the code quality
 */
function generateFullReport(): void {
  const reportsDir: string = path.join(process.cwd(), 'code-quality-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportFilename = `code-quality-report-${timestamp}.md`;
  const reportPath = path.join(reportsDir, reportFilename);

  fs.writeFileSync(reportPath, markdownContent);
  console.log(`Code quality report generated: ${reportPath}`);
}

/**
 * Traverses all the files and folders recursively to check the current folder, and outputs a report on the code quality.
 * @param fullPathRootDir
 */
function codeQualityRunner(fullPathRootDir?: string): void {
  try {
    ROOT_DIR = fullPathRootDir ?? ROOT_DIR;
    console.log('Running npm install...');
    execSync(`cd ${ROOT_DIR} && npm install`, { stdio: 'inherit' });

    eslintReporter();
    traverseFilesAndFoldersForIssues(ROOT_DIR);
    generateFullReport();

  } catch (error: any) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

codeQualityRunner(src);
