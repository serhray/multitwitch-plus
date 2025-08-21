module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable problematic rules for production build
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'warn'
  }
};
