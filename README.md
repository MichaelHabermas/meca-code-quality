# 📊 Meca-Code-Quality: Comprehensive Code Quality Analyzer 🔍

## 🌟 Overview

Meca-Code-Quality is a powerful JavaScript and TypeScript code quality analysis tool that provides deep insights into your project's codebase. It offers:
- File type counting
- Markdown report generation
- Comprehensive project structure analysis
- Basic ESLint analysis (COMING SOON)
- Basic StyleLint analysis (COMING SOON)
- Basic Strict Mode analysis (COMING SOON)

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

### Run From Command Line
```bash
npx meca-code-quality "{put full path to local repo/folder here, no curly braces}"
```

## 💻 Usage

### CLI Commands

```bash
# Run basic analysis
npx meca-code-quality --config custom-config.js
```

## 📊 Sample Report Output

The generated markdown report includes:
- Total number of files (js/jsx, ts/tsx, css/sass/scss/less, other styling files (ex. .style.js))
- File type distribution
- ESLint violations summary (COMING SOON)
- StyleLint violations summary (COMING SOON)
- Strict Mode violations summary (COMING SOON)
- Complexity metrics - number of:
  - !important usages
  - margin usages
  - useRefs
  - inline styles
  - RxJs Subscriptions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
