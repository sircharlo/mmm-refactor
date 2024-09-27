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
    'plugin:vue/vue3-recommended',
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
      'perfectionist/sort-vue-attributes': [
        'error',
        {
          // Based on: https://eslint.vuejs.org/rules/attributes-order.html
          // Note: I think this matches on attribute strings for everything that comes BEFORE the equal sign (=), if there is one. This makes some things impossible to match.
          // See issue: https://github.com/azat-io/eslint-plugin-perfectionist/issues/112
          // See guide on extended glob matching: https://www.linuxjournal.com/content/bash-extended-globbing
          customGroups: {
            /* eslint-disable perfectionist/sort-objects */
            DEFINITION: '@(is|v-is)',
            LIST_RENDERING: 'v-for',
            CONDITIONALS: 'v-@(if|else-if|else|show|cloak)',
            RENDER_MODIFIERS: 'v-@(pre|once)',
            GLOBAL: '@(id|:id)',
            UNIQUE: '@(ref|:ref|key|:key)',
            SLOT: '@(v-slot|slot|#*)',
            TWO_WAY_BINDING: '@(v-model|v-model:*)',
            OTHER_DIRECTIVES: '@(v-!(on|bind|html|text))', // Matches all "v-" directives except v-on, v-bind, v-html, v-text (these are defined separately below, which are lower in the order of operations)
            ATTR_DYNAMIC: '@(v-bind:*|:*)', // For dynamic bindings, like v-bind:prop or :prop.
            // ATTR_STATIC: "", // For normal props, like prop="example". No glob patterns possible since we are matching on everything BEFORE the equal sign (=), if there is one. Therefore we can't differentiate boolean props from static props.
            // ATTR_SHORTHAND_BOOL: "", // For boolean props, like custom-prop. No glob patterns possible since we are matching on everything BEFORE the equal sign (=), if there is one. Therefore we can't differentiate boolean props from static props.
            EVENTS: '@(v-on|@*)',
            CONTENT: 'v-@(html|text)',
            /* eslint-enable perfectionist/sort-objects */
          },
          groups: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            ['ATTR_DYNAMIC', 'unknown', 'multiline', 'shorthand'], // 'unknown' is a workaround because perfectionist/sort-vue-attributes cannot match on ATTR_STATIC or ATTR_SHORTHAND_BOOL
            'EVENTS',
            'CONTENT',
          ],
          type: 'natural',
        },
      ],
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
