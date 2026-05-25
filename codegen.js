/** @type {import('@graphql-codegen/cli').CodegenConfig} */
module.exports = {
  schema: process.env.GRAPHQL_SCHEMA_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5074/graphql/',
  documents: ['src/api/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    'src/api/__generated__/graphql-types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        skipTypename: true,
        scalars: {
          UUID: 'string',
          DateTime: 'string',
          Decimal: 'number',
        },
      },
    },
  },
  config: {
    skipTypename: true,
  },
  pluckConfig: {
    globalGqlIdentifierName: ['gql', 'graphql'],
  },
};