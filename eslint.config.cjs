module.exports = [
  // Global ignore
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
      boundaries: require('eslint-plugin-boundaries'),
      import: require('eslint-plugin-import'),
      prettier: require('eslint-plugin-prettier'),
    },
    settings: {
      'import/resolver': {
        typescript: {project: ['./tsconfig.json']},
      },
      'boundaries/elements': [
        {type: 'shared', pattern: 'src/shared/**'},
        {type: 'slices', pattern: 'src/slices/**'},
      ],
    },
    rules: {
      'prettier/prettier': ['error'],
      // indentation 2 spaces
      indent: ['error', 2],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],

      // import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:?', '^\\w'],
            ['^@/shared', '^@/slices', '^'],
            ['^\\./(?=.*/)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': ['error'],
      'import/newline-after-import': ['error', {count: 1}],

      // boundaries
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {from: 'slices', allow: ['shared', 'slices']},
            {from: 'shared', allow: ['shared']},
          ],
        },
      ],

      // intentionally removed no-restricted-imports to avoid schema issues in flat database
    },
  },

  // JS files - basic rules and prettier
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {prettier: require('eslint-plugin-prettier')},
    rules: {
      'prettier/prettier': ['error'],
      'no-console': 'warn',
    },
  },
];
