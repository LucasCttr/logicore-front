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
  drivers?: Driver[];
  driver?: Driver | null;
  availableDrivers?: Driver[];
  driverDetails?: {
    items: DriverDetailsWithUser[];
    total: number;
    page: number;
    pageSize: number;
  };
  myDriverProfile?: Driver | null;
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

const GET_DRIVERS_QUERY = `
  query GetDrivers {
    drivers {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_DRIVER_QUERY = `
  query GetDriver($id: ID!) {
    driver(id: $id) {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_AVAILABLE_DRIVERS_QUERY = `
  query GetAvailableDrivers {
    availableDrivers {
      ${DRIVER_FIELDS}
    }
  }
`;

const GET_DRIVER_DETAILS_QUERY = `
  query GetDriverDetails($page: Int!, $pageSize: Int!, $search: String, $isActive: Boolean) {
    driverDetails(page: $page, pageSize: $pageSize, search: $search, isActive: $isActive) {
      items {
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
      }
      total
      page
      pageSize
    }
  }
`;

const GET_MY_DRIVER_PROFILE_QUERY = `
  query GetMyDriverProfile {
    myDriverProfile {
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
  return unwrapResult(response.drivers ?? []);
}

export async function getDriverById(id: string): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse, { id: string }>(GET_DRIVER_QUERY, { id });
  return unwrapResult(response.driver);
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const response = await requestGraphQL<DriversQueryResponse>(GET_AVAILABLE_DRIVERS_QUERY);
  return unwrapResult(response.availableDrivers ?? []);
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

  return unwrapResult(response.driverDetails);
}

export async function getMyDriverProfile(): Promise<Driver> {
  const response = await requestGraphQL<DriversQueryResponse>(GET_MY_DRIVER_PROFILE_QUERY);
  return unwrapResult(response.myDriverProfile);
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
