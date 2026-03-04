module.exports = {
  // Top-level configs (apply to JS and generally)
  plugins: ['prettier', 'simple-import-sort', 'import', 'boundaries'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'prettier'],
  // ignore output/build folders and node_modules
  ignorePatterns: ['dist', 'build', 'node_modules', 'coverage'],
  settings: {
    'boundaries/elements': [
      {type: 'libs', pattern: 'src/libs/**'},
      {type: 'application', pattern: 'src/application/**'},
      {type: 'students', pattern: 'src/students/**'},
    ],
  },
  rules: {
    'prettier/prettier': ['error'],
    // general JS rules
    'no-console': 'warn',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2022,
      },
      plugins: ['@typescript-eslint', 'import', 'simple-import-sort', 'boundaries', 'prettier'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
      ],
      settings: {
        'import/resolver': {
          typescript: {project: ['./tsconfig.json']},
        },
      },
      rules: {
        // indentation: 2 spaces
        indent: ['error', 2],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],

        // sort imports/exports alphabetically (via simple-import-sort)
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^node:?', '^\\w'],
              ['^src/libs', '^src/application', '^src/students', '^'],
              ['^\\./(?=.*/)', '^\\.(?!/?$)', '^\\./?$'],
            ],
          },
        ],
        'simple-import-sort/exports': ['error'],

        'import/newline-after-import': ['error', {count: 1}],

        // bounded-context rules
        'boundaries/element-types': [
          'error',
          {
            default: 'disallow',
            rules: [
              {from: 'application', allow: ['application', 'libs']},
              {from: 'students', allow: ['students', 'libs']},
              {from: 'libs', allow: ['libs']},
            ],
          },
        ],

        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                name: 'src/students/*',
                message: 'application should not import from students; use src/libs or src/application',
              },
              {
                name: 'src/application/*',
                message: 'students should not import from application; use src/libs or src/students',
              },
            ],
          },
        ],
      },
    },
  ],
  root: true,
};
