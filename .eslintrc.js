const NodeGlobals = ['module', 'require'];

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['**/dist', 'dev/', 'api-extractor.json', 'packages/*/dist'],
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    // Fix "no-unused-vars" check on function parameters within TypeScript Types/Interfaces
    '@typescript-eslint/no-unused-vars': [
      'error',
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: '.*', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    // most of the codebase are expected to be env agnostic
    'no-restricted-globals': ['error', ...NodeGlobals],
    // forbidden to use export default
    'no-restricted-syntax': [
      0,
      {
        selector: 'ExportDefaultDeclaration',
        message: 'Forbidden to use export default.',
      },
    ],
    camelcase: [
      'error',
      {
        properties: 'never',
      },
    ],
    semi: [0, 'never'],
    eqeqeq: [2, 'allow-null'],
    quotes: ['error', 'single'],
    'no-var': 2,
    'prefer-const': 2,
    'func-style': [0, 'declaration'],
    'comma-dangle': ['error', 'always-multiline'],
    'multiline-ternary': ['error', 'always-multiline'],
    'multiline-comment-style': ['error', 'separate-lines'],
  },
  overrides: [
    {
      files: ['scripts/**', '*.config.js', '.eslintrc.js', '**/__tests__/**'],
      rules: {
        'object-curly-newline': 'off',
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['.eslintrc.js'],
      rules: {
        'array-element-newline': ['error', 'consistent'],
        'object-curly-newline': ['error', { consistent: true }],
      },
    },
  ],
};
