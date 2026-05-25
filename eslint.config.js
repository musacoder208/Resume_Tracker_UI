import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // =========================
  // Browser / App code — all .ts and .tsx
  // =========================
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,

      // TypeScript – syntax rules
      ...tseslint.configs.recommended,

      // TypeScript – type-aware rules (requires parserOptions.project)
      ...tseslint.configs.recommendedTypeChecked,

      // React hooks — includes rules-of-hooks: error, exhaustive-deps: warn
      reactHooks.configs.flat.recommended,

      // Vite HMR safety — includes only-export-components: warn
      reactRefresh.configs.vite,
    ],

    plugins: {
      react: reactPlugin,
    },

    settings: {
      // Auto-detect React version so react/jsx-* rules work correctly
      react: { version: 'detect' },
    },

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,

      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      /* ===== ERP / LIMS SAFETY RULES ===== */

      // Disallow `any`
      '@typescript-eslint/no-explicit-any': 'error',

      // Catch unused variables (ignore `_` prefix)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prevent unsafe async usage (type-aware)
      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreVoid: true, ignoreIIFE: true },
      ],

      // Unsafe boolean logic — warn not error so dev speed is maintained.
      // CI uses --max-warnings 0 to block these on merge.
      '@typescript-eslint/strict-boolean-expressions': [
        'warn',
        { allowNullableBoolean: true, allowNullableString: true },
      ],

      // Console — warn locally; CI promotes to error via --max-warnings 0
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      /* ===== REACT RULES ===== */

      // Require keys on list elements — catches runtime perf bugs
      'react/jsx-key': 'error',

      // Flag unnecessary fragment wrappers
      'react/jsx-no-useless-fragment': 'warn',

      // Not needed with React 19 new JSX transform
      'react/react-in-jsx-scope': 'off',

      // Conflicts with React patterns
      'no-extra-boolean-cast': 'off',

      /* ===== IMPORT BOUNDARY RULES ===== */
      // Scoped to src/features/** (see block below).
      // App-level files (router, layout, middleware) are allowed to
      // import from any feature — that is their job.
    },
  },

  // =========================
  // .tsx — Relax return type annotation
  // JSX inference is sufficient for component files.
  // =========================
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // =========================
  // .ts — Strict return types
  // Utilities, services, slices, hooks, and mappers must be fully typed.
  // =========================
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },

  // =========================
  // Feature modules — cross-feature import boundary
  // Only files inside src/features/ are restricted from importing
  // other features. App-level code (router, layout, middleware)
  // is intentionally excluded from this rule.
  // =========================
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/**'],
              message:
                'Cross-feature imports are not allowed. Move shared code to components/, hooks/, services/, types/, constants/, or utils/.',
            },
          ],
        },
      ],
    },
  },

  // =========================
  // Node / Tooling code
  // =========================
  {
    files: ['vite.config.ts'],

    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // Tooling files must never log to console — use exit codes instead
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    },
  },
])
