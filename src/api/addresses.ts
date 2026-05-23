import { requestGraphQL, unwrapResult } from './graphqlClient';

type AddressQueryResponse = {
  getAddressSuggestions?: string[];
  recordSelectedAddress?: boolean;
};

const ADDRESS_SUGGESTIONS_QUERY = `
  query GetAddressSuggestions($q: String!) {
    getAddressSuggestions(q: $q)
  }
`;

const RECORD_SELECTED_ADDRESS_MUTATION = `
  mutation RecordSelectedAddress($address: String!) {
    recordSelectedAddress(address: $address)
  }
`;

export async function getAddressSuggestions(query: string): Promise<string[]> {
  const response = await requestGraphQL<AddressQueryResponse, { q: string }>(ADDRESS_SUGGESTIONS_QUERY, { q: query });
  return unwrapResult(response.getAddressSuggestions ?? []);
}

export async function recordSelectedAddress(address: string): Promise<boolean> {
  const response = await requestGraphQL<AddressQueryResponse, { address: string }>(RECORD_SELECTED_ADDRESS_MUTATION, { address });
  return unwrapResult(response.recordSelectedAddress);
}
