import type { Driver, RegisterDriverDto, UpdateDriverStatusDto } from '../types/drivers';
import { requestGraphQL, unwrapResult } from './graphqlClient';

type DriverDetailsWithUser = {
  id: string;
  userId: string;
  driverId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  isUserActive: boolean;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  insuranceExpiry: string;
  assignedVehicleId?: string | null;
  assignedVehiclePlate?: string | null;
  assignedVehicleMake?: string | null;
  assignedVehicleModel?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

type DriversQueryResponse = {
  getDrivers?: Driver[];
  getDriver?: Driver | null;
  getAvailableDrivers?: Driver[];
  getDriverDetails?: {
    items: DriverDetailsWithUser[];
    total: number;
    page: number;
    pageSize: number;
  };
  getMyDriverProfile?: Driver | null;
  registerDriver?: Driver;
  updateDriver?: Driver;
  updateDriverStatus?: Driver;
  assignVehicleToDriver?: Driver;
};

const DRIVER_FIELDS = `
  id
  name
  phone
  licenseNumber
  isActive
  applicationUserId
  assignedVehicleId
  assignedVehicle {
    id
    licensePlate
    make
    model
  }
`;

const DRIVER_DETAILS_FIELDS = `
  id
  userId
  driverId
  firstName
  lastName
  email
  isUserActive
  licenseNumber
  licenseType
  licenseExpiry
  insuranceExpiry
  assignedVehicleId
  assignedVehiclePlate
  assignedVehicleMake
  assignedVehicleModel
  createdAt
  updatedAt
`;

const GET_DRIVERS_QUERY = `
  query GetDrivers {
    getDrivers {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_DRIVER_QUERY = `
  query GetDriver($id: ID!) {
    getDriver(id: $id) {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_AVAILABLE_DRIVERS_QUERY = `
  query GetAvailableDrivers {
    getAvailableDrivers {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_DRIVER_DETAILS_QUERY = `
  query GetDriverDetails($page: Int!, $pageSize: Int!, $search: String, $isActive: Boolean) {
    getDriverDetails(page: $page, pageSize: $pageSize, search: $search, isActive: $isActive) {
      items {
        ${DRIVER_DETAILS_FIELDS}
      }
      total
      page
      pageSize
    }
  }
`;

const GET_MY_DRIVER_PROFILE_QUERY = `
  query GetMyDriverProfile {
    getMyDriverProfile {
      ${DRIVER_FIELDS}
      assignedVehicle {
        id
        licensePlate
        make
        model
      }
    }
  }
`;

const REGISTER_DRIVER_MUTATION = `
  mutation RegisterDriver($request: RegisterDriverCommandInput!) {
    registerDriver(request: $request) {
      ${DRIVER_FIELDS}
    }
  }
`;

const UPDATE_DRIVER_STATUS_MUTATION = `
  mutation UpdateDriverStatus($id: ID!, $request: UpdateDriverStatusCommandInput!) {
    updateDriverStatus(id: $id, request: $request) {
      ${DRIVER_FIELDS}
    }
  }
`;

const ASSIGN_VEHICLE_MUTATION = `
  mutation AssignVehicleToDriver($id: ID!, $vehicleId: ID) {
    assignVehicleToDriver(id: $id, vehicleId: $vehicleId) {
      ${DRIVER_FIELDS}
    }
  }
`;

const UPDATE_DRIVER_MUTATION = `
  mutation UpdateDriver($id: ID!, $request: UpdateDriverCommandInput!) {
    updateDriver(id: $id, request: $request) {
      ${DRIVER_FIELDS}
    }
  }
`;

export async function getDrivers(): Promise<Driver[]> {
  const response = await requestGraphQL<DriversQueryResponse>(GET_DRIVERS_QUERY);
  return unwrapResult(response.getDrivers ?? []);
}

export async function getDriverById(id: string): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { id: string }>(GET_DRIVER_QUERY, { id });
  return unwrapResult(response.getDriver);
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const response = await requestGraphQL<DriversQueryResponse>(GET_AVAILABLE_DRIVERS_QUERY);
  return unwrapResult(response.getAvailableDrivers ?? []);
}

export async function getDriversWithDetails(
  page = 1,
  pageSize = 15,
  search?: string,
  isActive?: boolean,
): Promise<{ items: DriverDetailsWithUser[]; total: number; page: number; pageSize: number }> {
  const response = await requestGraphQL<DriversQueryResponse, { page: number; pageSize: number; search?: string; isActive?: boolean }>(
    GET_DRIVER_DETAILS_QUERY,
    { page, pageSize, search, isActive },
  );

  return unwrapResult(response.getDriverDetails);
}

export async function getMyDriverProfile(): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse>(GET_MY_DRIVER_PROFILE_QUERY);
  return unwrapResult(response.getMyDriverProfile);
}

export async function registerDriver(payload: RegisterDriverDto): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { request: RegisterDriverDto }>(
    REGISTER_DRIVER_MUTATION,
    { request: payload },
  );

  return unwrapResult(response.registerDriver);
}

export async function updateDriverStatus(id: string, payload: UpdateDriverStatusDto): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { id: string; request: UpdateDriverStatusDto }>(
    UPDATE_DRIVER_STATUS_MUTATION,
    { id, request: payload },
  );

  return unwrapResult(response.updateDriverStatus);
}

export async function assignVehicleToDriver(driverId: string, vehicleId: string | null): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { id: string; vehicleId: string | null }>(
    ASSIGN_VEHICLE_MUTATION,
    { id: driverId, vehicleId },
  );

  return unwrapResult(response.assignVehicleToDriver);
}

export async function updateDriver(id: string, payload: { firstName: string; lastName: string; email: string; licenseNumber: string; phone: string }): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { id: string; request: { firstName: string; lastName: string; email: string; licenseNumber: string; phone: string } }>(
    UPDATE_DRIVER_MUTATION,
    { id, request: payload },
  );

  return unwrapResult(response.updateDriver);
}
