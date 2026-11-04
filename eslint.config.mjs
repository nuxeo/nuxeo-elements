import js from '@eslint/js';
import html from 'eslint-plugin-html';
import importPlugin from 'eslint-plugin-import';
import wc from 'eslint-plugin-wc';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import uiConfig from './ui/eslint.config.mjs';
import datavizDemoConfig from './dataviz/demo/eslint.config.mjs';

// Syntax that polymer-analyzer 3.2.4 (babylon 7.0.0-beta.47) cannot parse. A file using any of it is
// dropped by `polymer analyze` and by the Nuxeo Web UI Designer catalog generator, together with the
// elements it defines (WEBUI-1922, WEBUI-2418). Use explicit guards instead, e.g. `a && a.b`, an
// explicit `!== undefined && !== null` check, or `catch (e)`.
// Keep in sync with the same list in nuxeo-web-ui's eslint.config.mjs.
const polymerAnalyzerUnsupportedSyntax = [
  {
    selector: 'ChainExpression',
    message: 'Optional chaining (?.) is not supported by polymer-analyzer. Use explicit && guards.',
  },
  {
    selector: "LogicalExpression[operator='??']",
    message: 'Nullish coalescing (??) is not supported by polymer-analyzer. Use an explicit null/undefined check.',
  },
  {
    selector: 'CatchClause[param=null]',
    message: 'Optional catch binding is not supported by polymer-analyzer. Use catch (e).',
  },
  {
    selector: 'AssignmentExpression[operator=/^(\\|\\||&&|\\?\\?)=$/]',
    message: 'Logical assignment (||=, &&=, ??=) is not supported by polymer-analyzer.',
  },
  { selector: 'PropertyDefinition', message: 'Class fields are not supported by polymer-analyzer.' },
  { selector: 'StaticBlock', message: 'Class static blocks are not supported by polymer-analyzer.' },
  { selector: 'PrivateIdentifier', message: 'Private #members are not supported by polymer-analyzer.' },
  { selector: 'Literal[bigint]', message: 'BigInt literals are not supported by polymer-analyzer.' },
  {
    // Any numeric literal whose source text contains `_` (`1_000`, `.1_2`, `1_000e-2`, `0b1_0`); the type check keeps
    // string literals such as 'a_b' out of it. BigInt literals are covered by the selector above.
    selector: 'Literal[value=type(number)][raw=/_/]',
    message: 'Numeric separators are not supported by polymer-analyzer.',
  },
  { selector: 'ExportAllDeclaration[exported]', message: '`export * as ns` is not supported by polymer-analyzer.' },
  {
    selector: 'ImportDeclaration[attributes.length>0]',
    message: 'Import attributes are not supported by polymer-analyzer.',
  },
  {
    selector: ':matches(ExportNamedDeclaration, ExportAllDeclaration)[attributes.length>0]',
    message: 'Export attributes are not supported by polymer-analyzer.',
  },
  {
    // Any `await` with no function around it, wherever it sits in the expression (`wrap(await f())`,
    // `export const v = await f()`, `(await f()).x`); awaits inside functions are fine.
    selector: 'AwaitExpression:not(:function AwaitExpression)',
    message: 'Top-level await is not supported by polymer-analyzer.',
  },
  {
    selector: 'ForOfStatement[await=true]:not(:function ForOfStatement)',
    message: 'Top-level for await is not supported by polymer-analyzer.',
  },
  { selector: 'Literal[regex.flags=/[dv]/]', message: 'Regex d/v flags are not supported by polymer-analyzer.' },
];

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/test/load-all-tests.js',
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

  // Web component rules, covering the same packages `polymer lint -i {core,dataviz,ui}/**/*.js` did.
  // They recover part of what `polymer lint` checked; it was dropped in ELEMENTS-2018 because
  // polymer-linter depends on babel-traverse 6.x, which no fixed version of GHSA-67hx-6x53-jw92
  // exists for. Rules the codebase already satisfies are errors; the rest report as warnings so
  // pre-existing violations stay visible without failing the build.
  {
    files: ['core/**/*.js', 'dataviz/**/*.js', 'ui/**/*.js'],
    plugins: { wc },
    rules: {
      ...wc.configs['flat/recommended'].rules,
      'wc/guard-super-call': 'error',
      'wc/no-child-traversal-in-attributechangedcallback': 'error',
      'wc/no-child-traversal-in-connectedcallback': 'error',
      'wc/no-closed-shadow-root': 'error',
      'wc/no-constructor-params': 'error',
      'wc/no-customized-built-in-elements': 'error',
      'wc/no-exports-with-element': 'error',
      'wc/no-invalid-extends': 'error',
      'wc/no-typos': 'error',
      // The codebase has pre-existing violations of these rules (e.g. nuxeo-slots.js defines two
      // elements under a non-matching filename, iron-data-table.js declares a constructor, and
      // nuxeo-document-permissions.js uses on*-prefixed handler methods). eslint-plugin-wc does not
      // currently flag them because it doesn't recognise Nuxeo's Polymer-factory / Nuxeo.Element
      // definitions, but they are kept as warnings rather than errors so the build stays green if a
      // future class-based element trips them, matching the intent above.
      'wc/file-name-matches-element': 'warn',
      'wc/max-elements-per-file': 'warn',
      'wc/no-constructor': 'warn',
      'wc/no-method-prefixed-with-on': 'warn',
      'wc/attach-shadow-constructor': 'warn',
      'wc/define-tag-after-class-definition': 'warn',
      'wc/expose-class-on-global': 'warn',
      'wc/guard-define-call': 'warn',
      'wc/require-listener-teardown': 'warn',
      'wc/tag-name-matches-class': 'warn',
    },
  },

  // Source shipped to consumers (and read by `polymer analyze` / the Designer catalog generator) must not
  // use syntax polymer-analyzer cannot parse. Vendored code (ui/viewers/pdfjs) is already ignored globally.
  {
    files: ['core/**/*.{js,html}', 'dataviz/**/*.{js,html}', 'ui/**/*.{js,html}'],
    ignores: ['**/test/**', '**/demo/**', '**/*.test.js'],
    rules: {
      'no-restricted-syntax': ['error', ...polymerAnalyzerUnsupportedSyntax],
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
    files: ['web-dev-server.config.mjs', 'web-test-runner.config.mjs', 'scripts/**/*.mjs'],
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
