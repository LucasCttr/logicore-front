import { gql } from 'graphql-tag';
import type { CreateVehicleMutation, CreateVehicleMutationVariables, GetAvailableVehiclesQuery, GetVehicleQuery, GetVehicleQueryVariables, GetVehiclesQuery, UpdateVehicleMutation, UpdateVehicleMutationVariables } from './__generated__/graphql-types';
import { requestGraphQL, unwrapResult } from './graphqlClient';

export type Vehicle = {
  id: string;
  licensePlate?: string | null;
  make?: string | null;
  model?: string | null;
  maxWeightCapacity: number;
  maxVolumeCapacity: number;
  isActive?: boolean;
};

export type CreateVehicleRequest = {
  plate: string;
  make?: string;
  model?: string;
  maxWeightCapacity: number;
  maxVolumeCapacity: number;
};

export type UpdateVehicleRequest = {
  plate: string;
  make?: string;
  model?: string;
  maxWeightCapacity: number;
  maxVolumeCapacity: number;
  isActive: boolean;
};

const GET_VEHICLES_QUERY = gql`
  query GetVehicles {
    vehicles {
      id
      licensePlate
      make
      model
      maxWeightCapacity
      maxVolumeCapacity
      isActive
    }
  }
`;

const GET_VEHICLE_QUERY = gql`
  query GetVehicle($id: UUID!) {
    vehicle(id: $id) {
      id
      licensePlate
      make
      model
      maxWeightCapacity
      maxVolumeCapacity
      isActive
    }
  }
`;

const GET_AVAILABLE_VEHICLES_QUERY = gql`
  query GetAvailableVehicles {
    availableVehicles {
      id
      licensePlate
      make
      model
      maxWeightCapacity
      maxVolumeCapacity
      isActive
    }
  }
`;

const CREATE_VEHICLE_MUTATION = gql`
  mutation CreateVehicle($request: CreateVehicleDtoInput!) {
    createVehicle(request: $request) {
      id
      licensePlate
      make
      model
      maxWeightCapacity
      maxVolumeCapacity
      isActive
    }
  }
`;

const UPDATE_VEHICLE_MUTATION = gql`
  mutation UpdateVehicle($id: UUID!, $request: UpdateVehicleDtoInput!) {
    updateVehicle(id: $id, request: $request) {
      id
      licensePlate
      make
      model
      maxWeightCapacity
      maxVolumeCapacity
      isActive
    }
  }
`;

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await requestGraphQL<GetVehiclesQuery>(GET_VEHICLES_QUERY);
  return unwrapResult(response.vehicles ?? []);
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await requestGraphQL<GetVehicleQuery, GetVehicleQueryVariables>(GET_VEHICLE_QUERY, { id });
  return unwrapResult(response.vehicle);
}

export async function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  const response = await requestGraphQL<CreateVehicleMutation, CreateVehicleMutationVariables>(
    CREATE_VEHICLE_MUTATION,
    { request: data },
  );
  return unwrapResult(response.createVehicle);
}

export async function updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
  const response = await requestGraphQL<UpdateVehicleMutation, UpdateVehicleMutationVariables>(
    UPDATE_VEHICLE_MUTATION,
    { id, request: data },
  );
  return unwrapResult(response.updateVehicle);
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const response = await requestGraphQL<GetAvailableVehiclesQuery>(GET_AVAILABLE_VEHICLES_QUERY);
  return unwrapResult(response.availableVehicles ?? []);
}
