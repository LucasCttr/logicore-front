import type LocationDto from '../types/locations';
import type { CreateLocationDto } from '../types/locations';
import { requestGraphQL, unwrapResult } from './graphqlClient';

type LocationsQueryResponse = {
  getLocations?: LocationDto[];
  createLocation?: LocationDto;
};

const LOCATION_FIELDS = `
  id
  name
  addressLine1
  addressLine2
  city
  state
  postalCode
  country
  createdAt
`;

const LOCATIONS_QUERY = `
  query GetLocations {
    getLocations {
      ${LOCATION_FIELDS}
    }
  }
`;

const CREATE_LOCATION_MUTATION = `
  mutation CreateLocation($request: CreateLocationCommandInput!) {
    createLocation(request: $request) {
      ${LOCATION_FIELDS}
    }
  }
`;

export async function getLocations(): Promise<LocationDto[]> {
  const response = await requestGraphQL<LocationsQueryResponse>(LOCATIONS_QUERY);
  return unwrapResult(response.getLocations ?? []);
}

export async function createLocation(payload: CreateLocationDto): Promise<LocationDto> {
  const response = await requestGraphQL<LocationsQueryResponse, { request: CreateLocationDto }>(
    CREATE_LOCATION_MUTATION,
    { request: payload },
  );
  return unwrapResult(response.createLocation);
}

const locationsApi = { getLocations, createLocation };

export default locationsApi;
