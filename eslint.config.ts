import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import { browser } from 'globals'

const namingConventionRules = {
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'interface',
      format: ['PascalCase'],
    },
    {
      selector: 'typeAlias',
      format: ['PascalCase'],
    },
    {
      selector: 'class',
      format: ['PascalCase'],
    },
    {
      selector: 'method',
      format: ['camelCase'],
    },
    {
      selector: 'function',
      format: ['camelCase'],
    },
    // {
    //   selector: 'variableLike',
    //   format: ['camelCase'],
    // },
  ],
  '@typescript-eslint/no-explicit-any': 'off',
}

const globals = {
  ...browser,
  __APP_VERSION__: 'readonly',
}

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    ignores: ['**/*.json.js', 'app/', 'src/.generated/'],
  },
  {
    files: ['**/*.ts', '**/*.svelte.ts'],
    ignores: ['eslint.config.ts'],
    languageOptions: {
      globals,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: namingConventionRules,
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      globals,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: namingConventionRules,
  },
]
