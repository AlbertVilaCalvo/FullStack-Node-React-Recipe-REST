module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // https://github.com/import-js/eslint-plugin-import#typescript
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  settings: {
    // https://github.com/import-js/eslint-plugin-import#typescript
    // https://github.com/import-js/eslint-import-resolver-typescript#configuration
    'import/resolver': {
      node: true,
      typescript: true,
    },
  },
  rules: {
    'import/no-default-export': 'error',
  },
  overrides: [
    // Allow require() in .js files (e.g. in jest.setup.js)
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    // Allow empty functions (() => {}) for test files, because they are common in tests
    // for mock implementations, empty callbacks for the next middleware, etc.
    {
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
  ignorePatterns: ['build/'],
}
