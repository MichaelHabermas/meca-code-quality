# 📊 CodeScope: Comprehensive Code Quality Analyzer 🔍

## 🌟 Overview

CodeScope is a powerful JavaScript and TypeScript code quality analysis tool that provides deep insights into your project's codebase. It offers:
- File type counting
- ESLint integration
- Markdown report generation
- Comprehensive project structure analysis

## 🚀 Features

- 📁 Detailed file type breakdown
- 🔬 ESLint code quality checks
- 📋 Automated markdown report generation
- 🛡️ Support for JavaScript and TypeScript projects
- 📈 Easy-to-read visualization of project metrics

## 🛠️ Installation

### npm
```bash
npm install codescope --save-dev
```

### Yarn
```bash
yarn add codescope -D
```

## 📝 Configuration

Create a `codescope.config.js` in your project root:

```javascript
module.exports = {
  // Directories to scan
  directories: ['src', 'lib'],
  
  // File extensions to analyze
  extensions: ['.js', '.ts', '.jsx', '.tsx'],
  
  // ESLint configuration
  eslintConfig: {
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    rules: {
      // Custom ESLint rules
    }
  },
  
  // Report generation settings
  report: {
    format: 'markdown',
    outputPath: './codequality-report.md'
  }
}
```

## 💻 Usage

### CLI Commands

```bash
# Run basic analysis
npx codescope

# Generate detailed report
npx codescope --report

# Specify custom config
npx codescope --config custom-config.js
```

## 📂 Project Structure

```
codescope/
│
├── bin/                # CLI executable
├── lib/                # Core library code
│   ├── analyzers/      # File type and code quality analyzers
│   ├── reporters/      # Report generation modules
│   └── utils/          # Utility functions
│
├── templates/          # Report templates
├── config/             # Default configurations
├── tests/              # Package test suites
│
├── codescope.config.js # Default configuration file
└── package.json
```

## 🔧 Customization

### Extending File Type Detection
You can add custom file type detectors by extending the base analyzer:

```javascript
const { FileAnalyzer } = require('codescope');

class CustomFileAnalyzer extends FileAnalyzer {
  detectFileType(file) {
    // Custom file type detection logic
  }
}
```

## 📊 Sample Report Output

The generated markdown report includes:
- Total number of files
- File type distribution
- ESLint violation summary
- Complexity metrics
- Potential improvement suggestions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Your Name - [@YourTwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/codescope](https://github.com/yourusername/codescope)