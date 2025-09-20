module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Code style
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    // Best practices
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // ES6
    'arrow-spacing': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',

    // Potential errors
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'error',

    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
    {
      files: ['test/interactive/*.js'],
      rules: {
        'no-console': 'off', // Allow console in interactive scripts
      },
    },
    {
      files: ['api/**/*.js'],
      rules: {
        'no-console': 'off', // Allow console in API files for debugging
      },
    },
    {
      files: ['model/Configuration.js'],
      rules: {
        'no-console': 'off', // Allow console in Configuration for debugging
      },
    },
  ],
};
