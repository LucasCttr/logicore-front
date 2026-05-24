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

type VehiclesQueryResponse = {
  vehicles?: Vehicle[];
  vehicle?: Vehicle | null;
  availableVehicles?: Vehicle[];
  createVehicle?: Vehicle;
  updateVehicle?: Vehicle;
  deleteVehicle?: boolean;
  updateVehicleStatus?: Vehicle;
};

const VEHICLE_FIELDS = `
  id
  licensePlate
  make
  model
  maxWeightCapacity
  maxVolumeCapacity
  isActive
`;

const GET_VEHICLES_QUERY = `
  query GetVehicles {
    vehicles {
      ${VEHICLE_FIELDS}
    }
  }
`;

const GET_VEHICLE_QUERY = `
  query GetVehicle($id: ID!) {
    vehicle(id: $id) {
      ${VEHICLE_FIELDS}
    }
  }
`;

const GET_AVAILABLE_VEHICLES_QUERY = `
  query GetAvailableVehicles {
    availableVehicles {
      ${VEHICLE_FIELDS}
    }
  }
`;

const CREATE_VEHICLE_MUTATION = `
  mutation CreateVehicle($request: CreateVehicleDtoInput!) {
    createVehicle(request: $request) {
      ${VEHICLE_FIELDS}
    }
  }
`;

const UPDATE_VEHICLE_MUTATION = `
  mutation UpdateVehicle($id: ID!, $request: UpdateVehicleDtoInput!) {
    updateVehicle(id: $id, request: $request) {
      ${VEHICLE_FIELDS}
    }
  }
`;

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await requestGraphQL<VehiclesQueryResponse>(GET_VEHICLES_QUERY);
  return unwrapResult(response.vehicles ?? []);
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await requestGraphQL<VehiclesQueryResponse, { id: string }>(GET_VEHICLE_QUERY, { id });
  return unwrapResult(response.vehicle);
}

export async function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  const response = await requestGraphQL<VehiclesQueryResponse, { request: CreateVehicleRequest }>(
    CREATE_VEHICLE_MUTATION,
    { request: data },
  );
  return unwrapResult(response.createVehicle);
}

export async function updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
  const response = await requestGraphQL<VehiclesQueryResponse, { id: string; request: UpdateVehicleRequest }>(
    UPDATE_VEHICLE_MUTATION,
    { id, request: data },
  );
  return unwrapResult(response.updateVehicle);
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const response = await requestGraphQL<VehiclesQueryResponse>(GET_AVAILABLE_VEHICLES_QUERY);
  return unwrapResult(response.availableVehicles ?? []);
}
