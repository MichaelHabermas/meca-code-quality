#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
// import * as ts from 'typescript';
// import * as stylelint from 'stylelint';
// import { ESLint } from 'eslint';

/** Parse the command line */
const args = process.argv.slice(2);

// Validate input
if (args.length > 1) {
  console.log("Warning: Accommodates at most one argument (full path to desired root dir)");
  process.exit();
}

const src: string | undefined = args[0];

if (!fs.existsSync(src)) {
  console.log("Error: Source file doesn't exist. Given: ", src);
  process.exit();
}

/** TYPES **/
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
type Issues =  Record<'strict_mode', number>; // TODO: add 'styleLint'

interface ICounter {
  fileCounter: FileCounterRecord;
  filesLinesCounter: LinesRecord;
  filesContentCounter: FileContentRecord;
  problemIssues: Issues;
}


/** COUNTER OBJECTS **/
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
  // styleLint: 0 // TODO: add later
}


/** VARIABLES **/

const fileCounterKeys = Object.keys(fileCounter);
let ROOT_DIR = '.';
let markdownContent: string = '# JS / TS Repo Analysis Report\n\n';
const styleRegex = /\.style\.(js|jsx|ts|tsx)$/;

/** METHODS **/

/**
 * Counts the number of StyleLint problems/issues.
 * TODO: Get this working GENERALLY, or add a flag to enable.
 * TODO: change this so it runs once for the whole repo.
 */
// async function checkStyleLint(): Promise<void> {
//   // at end, make the rest a scoped function?
//   const strictModeOutput: string = execSync(`cd ${ROOT_DIR} && npx eslint . --config ./.eslintrc --format json`, { encoding: 'utf-8' });
//
//   const result = await stylelint.lint({ files: ROOT_DIR, formatter: 'string' });
//   console.log('checkStyleLint', result);
//   if (result.errored) {
//     // problemIssues.styleLint += result.report.split('\n').length - 1; // Subtract 1 for the final newline
//   }
//
//   // problemIssues.styleLint += result.results.length;
// }

/**
 * Counts the number of strict mode problems/issues.
 * TODO: Get this working GENERALLY, or add a flag to enable.
 * TODO: change this so it runs once for the whole repo.
 */
// function checkStrictMode(): void {
//   // at end, make the rest a scoped function?
//   const strictModeOutput: string = execSync(`cd ${ROOT_DIR} && npx eslint . --config ./.eslintrc --format json`, { encoding: 'utf-8' });
//
//   try {
//     const sourceFile = ts.createSourceFile(
//       ROOT_DIR,
//       fs.readFileSync(ROOT_DIR, 'utf8'),
//       ts.ScriptTarget.Latest,
//       true
//     );
//
//     if (!sourceFile) {
//       console.error(`Failed to create source file for ${ROOT_DIR}`);
//       problemIssues.strict_mode += 0;
//       return;
//     }
//
//     const program = ts.createProgram([ROOT_DIR], {});
//     const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
//
//     problemIssues.strict_mode += diagnostics.filter(({ category, code }) => category === ts.DiagnosticCategory.Error && code >= 2300 && code <= 2700).length;
//   } catch (error) {
//     console.error(`Error checking Strict Mode for ${ROOT_DIR}: ${error}`);
//   }
// }

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
 * Currently counted: !important, useRef, inline styles, margins, and RxJS subscriptions
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
// function formatEslintOutputToMarkdown(eslintJson: string): void {
//   try {
//     const parsedOutput: Array<IFile> = JSON.parse(eslintJson);
//
//     markdownContent += '## ESLint Summary\n\n';
//     const totalFiles = parsedOutput.length;
//     const filesWithIssues = parsedOutput.filter((file) => file.messages.length > 0).length;
//     const totalIssues = parsedOutput.reduce((sum, file) => sum + file.messages.length, 0);
//
//     markdownContent += `- **Total Files Analyzed**: ${totalFiles}\n`;
//     markdownContent += `- **Files with Issues**: ${filesWithIssues}\n`;
//     markdownContent += `- **Total Issues**: ${totalIssues}\n\n`;
//   } catch (error) {
//     console.error('Error formatting ESLint output:', error);
//     markdownContent += '## ESLint Analysis Report\n\nError parsing ESLint output.\n\n';
//   }
// }

/**
 * Formats the code quality results, and adds it to the markdown file
 * @param codeQualityJson
 */
function formatFileIssuesToMarkdown(codeQualityJson: ICounter): void {
  try {
    const { fileCounter, filesLinesCounter, filesContentCounter, problemIssues } = codeQualityJson

    markdownContent += '## Code Quality Summary\n\n';

    markdownContent += `- **Filename**: ${ROOT_DIR}\n`;

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
    // markdownContent += `- **Total Files with Strict Mode Issues**: ${problemIssues.strict_mode}\n\n`;
    // Style Lint Issues - TODO


  } catch (error) {
    console.error('Error formatting Code Quality output:', error);
    markdownContent += '## Code Quality Analysis Report\n\nError parsing Code Quality output.\n\n';
  }
}

/**
 * Runs eslint on the repo and adds results to the markdown results report.
 * TODO: Get this working GENERALLY, or add a flag to enable.
 */
// function eslintReporter(): void {
//     console.log('Running ESLint...');
//   // const eslintOutput: string = execSync(`cd ${ROOT_DIR} && npx eslint . --format json`, { encoding: 'utf-8' });
//   // const eslintOutput: string = execSync('npm run lint', { encoding: 'utf-8' });
//
//   try {
//     console.log(execSync(`pwd`, { encoding: 'utf-8' }));
//     const eslintOutput = execSync('npm run lint', { encoding: 'utf-8' }).toString();
//     // ... use eslintOutput
//
//     console.log('ESLint Output', eslintOutput);
//     formatEslintOutputToMarkdown(eslintOutput);
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("ESLint execution failed:", error.message);
//       // Handle the error, e.g., exit the script, log the error to a file, etc.
//     } else {
//       console.error("Unexpected error occurred during ESLint execution.");
//     }
//   }
//   // try {
//   // } catch (error: any) {
//   //   console.log('No ESLint config found.');
//   //   try {
//   //     console.log('Re-Running ESLint...');
//   //     const eslintOutput: string = execSync(`cd ${ROOT_DIR} && touch .eslintrc.js && npx eslint . --config ./.eslintrc.js --format json`, { encoding: 'utf-8' });
//   //
//   //     console.log('ESLint Output 2', eslintOutput);
//   //     formatEslintOutputToMarkdown(eslintOutput);
//   //   } catch (error: any) {
//   //     console.error('An error occurred:', error.message);
//   //     process.exit(1);
//   //   }
//   // }
// }
// function eslintReporter(): void {
//   console.log('Running ESLint...');
//
//   const currentDirectory = execSync(`pwd`, { encoding: 'utf-8' }).toString();
//   console.log('Current Directory:', currentDirectory);
//   console.log('ROOT_DIR:', ROOT_DIR);
//
//   try {
//     const eslintOutput = execFileSync('npm', ['run', 'lint'], {
//       cwd: currentDirectory,
//       encoding: 'utf-8'
//     }).toString();
//
//     console.log('ESLint Output:\n', eslintOutput);
//     formatEslintOutputToMarkdown(eslintOutput);
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("ESLint execution failed in directory:", currentDirectory);
//       console.error("Error Message:", error.message);
//     } else {
//       console.error("Unexpected error occurred during ESLint execution.");
//     }
//   }
//
//   // try {
//   // // const eslintOutput = execSync('npm run lint', {
//   // const eslintOutput = execSync(`cd ${ROOT_DIR} && npx eslint .`, {
//   // // const eslintOutput = execSync(`cd ${currentDirectory} && npx eslint .`, {
//   // //   cwd: ROOT_DIR,
//   //   encoding: 'utf-8',
//   //   // shell: 'cmd.exe'
//   // }).toString();
//   //
//   // //   const eslintOutput = execSync('npm run lint', { encoding: 'utf-8', cwd: currentDirectory }).toString();
//   //   console.log('ESLint Output:\n', eslintOutput);
//   //   formatEslintOutputToMarkdown(eslintOutput);
//   // } catch (error) {
//   //   if (error instanceof Error) {
//   //     console.error("ESLint execution failed in directory:", currentDirectory);
//   //     console.error("Error Message:", error.message);
//   //   } else {
//   //     console.error("Unexpected error occurred during ESLint execution.");
//   //   }
//   // }
//
//   // exec('npm run lint', { cwd: currentDirectory, shell: 'cmd.exe' }, (error, stdout, stderr) => {
//   //   if (error) {
//   //     console.error("ESLint execution failed:", error);
//   //     console.error("Stderr:", stderr);
//   //   } else {
//   //     console.log("ESLint Output:\n", stdout);
//   //     formatEslintOutputToMarkdown(stdout);
//   //   }
//   // });
// }

// function eslintReporter(): void {
//   console.log('Running ESLint...');
//
//   const currentDirectory = execSync(`pwd`, { encoding: 'utf-8' }).toString();
//   console.log('Current Directory:', currentDirectory);
//
//   let filesToLint = [];
//   const filesPaths = ['./src/**/*.js', './tests/**/*.js', './src/**/*.ts', './tests/**/*.ts', './src/**/*.jsx', './tests/**/*.jsx', './src/**/*.tsx', './tests/**/*.tsx']; // Adjust paths as needed
//
//   const existingFiles = filesPaths.filter((file) => fs.existsSync(file));
//
//   // const filesToLint = ['./src/**/*.ts', './tests/**/*.ts', './src/**/*.tsx', './tests/**/*.tsx']; // Adjust paths as needed
//   // const filesToLint = ['./src/**/*.js', './tests/**/*.js', './src/**/*.ts', './tests/**/*.ts']; // Adjust paths as needed
//   filesToLint = ['./**/*.ts']; // Adjust paths as needed
//
//   getESLintReport(filesToLint)
//     .then((report) => {
//       console.log(JSON.stringify(report, null, 2));
//       // You can further process the report here, such as:
//       // - Generating a summary of errors and warnings
//       // - Writing the report to a file
//       // - Integrating with a CI/CD pipeline
//     });
// }

// async function getESLintReport(files: string | string[]) {
//   try {
//     const eslint = new ESLint({
//       fix: false, // Set to true to automatically fix fixable violations
//       cwd: ROOT_DIR,
//     });
//
//     const results = await eslint.lintFiles(files);
//
//     // Format results for better readability
//     const formattedResults = results.map((result) => ({
//       filePath: result.filePath,
//       errorCount: result.errorCount,
//       warningCount: result.warningCount,
//       messages: result.messages.map((message) => ({
//         message: message.message,
//         line: message.line,
//         column: message.column,
//         severity: message.severity,
//         ruleId: message.ruleId,
//       })),
//     }));
//
//     return formattedResults;
//   } catch (error) {
//     console.error('Error generating ESLint report:', error);
//     return [];
//   }
// }

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
    // console.log('Running npm install...');
    // execSync(`cd ${ROOT_DIR} && npm install`, { stdio: 'inherit' });
    execSync(`cd ${ROOT_DIR}`, { stdio: 'inherit' });

    console.log('ESLint check skipped.');
    // eslintReporter();
    console.log('StyleLint check skipped.');
    // checkStyleLint();
    console.log('Strict Mode check skipped.');
    // checkStrictMode();

    traverseFilesAndFoldersForIssues(ROOT_DIR);
    generateFullReport();

  } catch (error: any) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

codeQualityRunner(src);
