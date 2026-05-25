import { gql } from 'graphql-tag';
import type { CreateLocationMutation, CreateLocationMutationVariables, GetLocationsQuery } from './__generated__/graphql-types';
import type LocationDto from '../types/locations';
import type { CreateLocationDto } from '../types/locations';
import { requestGraphQL, unwrapResult } from './graphqlClient';

const LOCATIONS_QUERY = gql`
  query GetLocations {
    locations {
      id
      name
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      createdAt
    }
  }
`;

const CREATE_LOCATION_MUTATION = gql`
  mutation CreateLocation($request: CreateLocationCommandInput!) {
    createLocation(request: $request) {
      id
      name
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      createdAt
    }
  }
`;

export async function getLocations(): Promise<LocationDto[]> {
  const response = await requestGraphQL<GetLocationsQuery>(LOCATIONS_QUERY);
  return unwrapResult(response.locations ?? []);
}

export async function createLocation(payload: CreateLocationDto): Promise<LocationDto> {
  const response = await requestGraphQL<CreateLocationMutation, CreateLocationMutationVariables>(
    CREATE_LOCATION_MUTATION,
    { request: payload },
  );
  return unwrapResult(response.createLocation);
}

const locationsApi = { getLocations, createLocation };

export default locationsApi;
