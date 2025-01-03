module.exports = {
  env: {
    browser: true, // Enable browser globals (e.g., window, document)
    node: true, // Enable Node.js globals
    es2021: true, // Enable ECMAScript 2021 features
  },
  extends: 'eslint:recommended', // Use the recommended ESLint rules
  parserOptions: {
    ecmaVersion: 'latest', // Use the latest ECMAScript version
    sourceType: 'module', // Enable module support
  },
  rules: {
    // Add any custom rules here
  },
};
