import { gql } from 'graphql-tag';
import type { GetAddressSuggestionsQuery, GetAddressSuggestionsQueryVariables, RecordSelectedAddressMutation, RecordSelectedAddressMutationVariables } from './__generated__/graphql-types';
import { requestGraphQL, unwrapResult } from './graphqlClient';

const ADDRESS_SUGGESTIONS_QUERY = gql`
  query GetAddressSuggestions($q: String!) {
    addressSuggestions(q: $q)
  }
`;

const RECORD_SELECTED_ADDRESS_MUTATION = gql`
  mutation RecordSelectedAddress($address: String!) {
    recordSelectedAddress(address: $address)
  }
`;

export async function getAddressSuggestions(query: string): Promise<string[]> {
  const response = await requestGraphQL<GetAddressSuggestionsQuery, GetAddressSuggestionsQueryVariables>(ADDRESS_SUGGESTIONS_QUERY, { q: query });
  return unwrapResult(response.addressSuggestions ?? []);
}

export async function recordSelectedAddress(address: string): Promise<boolean> {
  const response = await requestGraphQL<RecordSelectedAddressMutation, RecordSelectedAddressMutationVariables>(RECORD_SELECTED_ADDRESS_MUTATION, { address });
  return unwrapResult(response.recordSelectedAddress);
}
