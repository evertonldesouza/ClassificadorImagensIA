import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import globals from 'globals';
import pluginVitest from 'eslint-plugin-vitest';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/js/**/*.ts', 'src/__tests__/**/*.ts'],
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
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-alert': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'require-await': 'error',
      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      // Testes
      ...pluginVitest.configs.recommended.rules,
    },
  },
  {
    files: ['src/__tests__/**/*.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['vite.config.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  }
);
