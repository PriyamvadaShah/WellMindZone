import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        process: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Basic ESLint rules
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off', // <-- Disabled
      'no-undef': 'off',       // <-- Disabled
      'react/jsx-no-target-blank': 'off',
      
      // React-specific rules
      'react/prop-types': 'off', // <-- Disabled
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
      
      // Fix the key error
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Hooks rules
      ...reactHooks.configs.recommended.rules,
    },
  },
]