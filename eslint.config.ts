import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import { browser } from 'globals'

// const allowedProps = [
//   '\\d+',
//   '__[a-zA-Z_]+__',
//   '#',
//   'FlexSearch',
//   'sourceVar_ids',
//   'metaFolder_id',
//   'metaDataset_id',
//   'entity_id',
//   'modality_id',
//   'variable_id',
//   'dataset_id',
//   'folder_id',
//   'institution_id',
//   'tag_id',
//   'is_in_data',
//   'is_in_meta',
//   'one_to_one',
//   'one_to_many',
//   'many_to_many',
// ]

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
        regex: '^__[A-Z_]+__$',
        match: true,
      },
      format: null,
      custom: {
        regex: '^__[A-Z_]+__$',
        match: true,
      },
    },
    // {
    //   selector: 'property',
    //   format: ['camelCase'],
    //   leadingUnderscore: 'allow',
    //   trailingUnderscore: 'allow',
    //   filter: {
    //     regex: `^(${allowedProps.join('|')})$`,
    //     match: false,
    //   },
    // },
    // {
    //   selector: 'property',
    //   filter: {
    //     regex: `^(${allowedProps.join('|')})$`,
    //     match: true,
    //   },
    //   format: null,
    // },
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
