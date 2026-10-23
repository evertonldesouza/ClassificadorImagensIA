import js from '@eslint/js';
import globals from 'globals';
import pluginVitest from 'eslint-plugin-vitest';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2022,
        // Service Worker / PWA globals
        self: 'readonly',
        caches: 'readonly',
        // Injected by CDN scripts
        tf: 'readonly',
        mobilenet: 'readonly',
        cocoSsd: 'readonly',
      },
    },
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      // Qualidade / estilo
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-alert': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // Sem variáveis globais implícitas
      'no-undef': 'error',
      // Preferir const/let, nunca var
      'no-var': 'error',
      'prefer-const': 'error',
      // Boas práticas assíncronas
      'require-await': 'error',
      // Testes
      ...pluginVitest.configs.recommended.rules,
    },
  },
  {
    files: ['src/__tests__/**/*.test.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
