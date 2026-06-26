import js from '@eslint/js';
import html from 'eslint-plugin-html';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import uiConfig from './ui/eslint.config.mjs';
import datavizDemoConfig from './dataviz/demo/eslint.config.mjs';

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      'ui/import-href.js',
      'ui/widgets/nuxeo-selectivity.js',
      'ui/viewers/pdfjs/**',
      'ui/dataviz/randomColor.js',
      'ui/js-interpreter/**',
      'storybook/**',
      'ui/widgets/custom-date-picker.js',
    ],
  },

  // Base recommended rules
  js.configs.recommended,

  // Import plugin rules (replaces eslint-config-airbnb-base import rules)
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'bower_components'],
        },
      },
    },
    rules: {
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/test/**/*.js',
            '**/stories/**/*.js',
            '**/*.config.js',
            '**/*.config.mjs',
            '**/*.conf.js',
            'scripts/**',
          ],
        },
      ],
    },
  },

  // Main config for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        Nuxeo: 'writable',
      },
    },
    plugins: {
      html,
    },
    settings: {
      'html/indent': '+2',
      'html/report-bad-indent': 'error',
    },
    rules: {
      'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: true }],
      'arrow-parens': ['error', 'always'],
      'class-methods-use-this': 'off',
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
        },
      ],
      'consistent-return': 'off',
      eqeqeq: ['error', 'smart'],
      'func-names': 'off',
      'max-len': [
        'error',
        120,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignorePattern: '(^[ \\t]*\\w+\\$?=\\\'[^\']+\\\'$|^[ \\t]*\\w+\\$?=\\"[^"]+\\"$|^import[^;]+;$)',
        },
      ],
      'no-alert': 'off',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-multi-assign': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-sequences': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'padded-blocks': 'off',
      strict: 'error',
    },
  },

  // HTML files
  {
    files: ['**/*.html'],
    plugins: {
      html,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        Nuxeo: 'writable',
        Polymer: 'readonly',
      },
    },
    settings: {
      'html/indent': '+2',
      'html/report-bad-indent': 'error',
    },
  },

  // Test files
  {
    files: ['**/*.test.js', 'test/setup.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        assert: 'readonly',
        expect: 'readonly',
        sinon: 'readonly',
        suiteTeardown: 'readonly',
        suiteSetup: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },

  // Testing helpers (mocha globals)
  {
    files: ['testing-helpers/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        teardown: 'readonly',
      },
    },
  },

  // CommonJS scripts and config files (Node.js context)
  {
    files: ['prettier.config.js', 'scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      strict: 'off',
      'no-console': 'off',
    },
  },

  // ESM config files / dev-server plugins (Node.js context)
  {
    files: ['web-test-runner.config.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      strict: 'off',
      'no-console': 'off',
    },
  },

  // Directory-specific configs
  ...uiConfig,
  ...datavizDemoConfig,

  // Prettier must be last to disable conflicting rules
  prettier,
];