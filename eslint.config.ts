import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import { browser } from 'globals'

const allowedProps = [
  '__APP_VERSION__',
  'FlexSearch',
  'JSZip',
  'ADD_TAGS',
  'ADD_ATTR',
]

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
    {
      selector: 'variableLike',
      format: ['camelCase'],
    },
    {
      selector: 'variableLike',
      filter: {
        regex: '.*Component$',
        match: true,
      },
      format: ['PascalCase'],
    },
    {
      selector: 'variableLike',
      filter: {
        regex: '^__APP_VERSION__$',
        match: true,
      },
      format: null,
    },
    {
      selector: 'property',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'property',
      filter: {
        regex: `^(${allowedProps.join('|')})$`,
        match: true,
      },
      format: null,
    },
  ],
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
    ignores: [
      '**/*.json.js',
      'app/',
      'src/.generated/',
      'node_modules/',
      'public/assets/',
    ],
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
