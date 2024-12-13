# 📊 Meca-Code-Quality: Comprehensive Code Quality Analyzer 🔍

## 🌟 Overview

Meca-Code-Quality is a powerful JavaScript and TypeScript code quality analysis tool that provides deep insights into your project's codebase. It offers:
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
npm install meca-code-quality --save-dev
```

### Yarn
```bash
yarn add meca-code-quality -D
```

## 📝 Configuration

Create a `meca-code-quality.config.js` in your project root:

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
npx meca-code-quality

# Generate detailed report
npx meca-code-quality --report

# Specify custom config
npx meca-code-quality --config custom-config.js
```

## 📂 Project Structure

```
meca-code-quality/
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
└── package.json
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
