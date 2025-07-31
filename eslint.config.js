import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    extends: [
      js.configs.recommended,
    ],
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-console': 'warn',
      'camelcase': ['error', { properties: 'never', ignoreDestructuring: true }],
    },
  },
]);
