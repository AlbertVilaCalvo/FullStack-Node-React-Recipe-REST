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
  ignorePatterns: ['build/'],
}
