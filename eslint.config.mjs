import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// import perfectionist from 'eslint-plugin-perfectionist';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '**/src-capacitor/',
      '**/src-cordova/',
      '**/.quasar/',
      '**/node_modules/*',
      '**/.eslintrc.cjs',
      'quasar.config.*.temporary.compiled*',
      '**/dist/',
      '**/electron-flag.d.ts',
      '**/store-flag.d.ts',
      '**/quasar.d.ts',
    ],
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:perfectionist/recommended-natural-legacy',
    'prettier',
  ),
  {
    languageOptions: {
      ecmaVersion: 5,

      globals: {
        ...globals.browser,
        ...globals.node,
        __QUASAR_SSR__: 'readonly',
        __QUASAR_SSR_CLIENT__: 'readonly',
        __QUASAR_SSR_PWA__: 'readonly',
        __QUASAR_SSR_SERVER__: 'readonly',
        __statics: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly',
        cordova: 'readonly',
        ga: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: tsParser,
      },

      sourceType: 'commonjs',
    },

    plugins: {
      // perfectionist,
      '@typescript-eslint': typescriptEslint,
      vue,
    },

    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',

      '@typescript-eslint/no-var-requires': 'off',

      'no-debugger': 'off',
      'no-unused-vars': 'off',
      'perfectionist/sort-interfaces': 'error',
      'prefer-promise-reject-errors': 'off',
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
  },
];
