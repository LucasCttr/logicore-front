import { gql } from 'graphql-tag';
import type {
  AssignVehicleToDriverMutation,
  AssignVehicleToDriverMutationVariables,
  GetAvailableDriversQuery,
  GetDriverDetailsQuery,
  GetDriverDetailsQueryVariables,
  GetDriverQuery,
  GetDriverQueryVariables,
  GetDriversQuery,
  GetMyDriverProfileQuery,
  RegisterDriverMutation,
  RegisterDriverMutationVariables,
  UpdateDriverMutation,
  UpdateDriverMutationVariables,
  UpdateDriverStatusMutation,
  UpdateDriverStatusMutationVariables,
} from './__generated__/graphql-types';
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

function normalizeDriver(driver: { email?: string | null; name?: string | null; [key: string]: unknown }): Driver {
  return {
    ...(driver as Driver),
    name: (driver.name as string | null | undefined) ?? driver.email ?? '',
  };
}

const GET_DRIVERS_QUERY = gql`
  query GetDrivers {
    drivers {
      id
      email
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
    }
  }
`;

const GET_DRIVER_QUERY = gql`
  query GetDriver($id: UUID!) {
    driver(id: $id) {
      id
      email
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
    }
  }
`;

const GET_AVAILABLE_DRIVERS_QUERY = gql`
  query GetAvailableDrivers {
    availableDrivers {
      id
      email
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
    }
  }
`;

const GET_DRIVER_DETAILS_QUERY = gql`
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

const GET_MY_DRIVER_PROFILE_QUERY = gql`
  query GetMyDriverProfile {
    myDriverProfile {
      id
      email
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
    }
  }
`;

const REGISTER_DRIVER_MUTATION = gql`
  mutation RegisterDriver($request: RegisterDriverCommandInput!) {
    registerDriver(request: $request) {
      id
      email
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
    }
  }
`;

const UPDATE_DRIVER_STATUS_MUTATION = gql`
  mutation UpdateDriverStatus($id: UUID!, $request: UpdateDriverStatusCommandInput!) {
    updateDriverStatus(id: $id, request: $request) {
      id
      email
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
    }
  }
`;

const ASSIGN_VEHICLE_MUTATION = gql`
  mutation AssignVehicleToDriver($id: UUID!, $vehicleId: UUID) {
    assignVehicleToDriver(id: $id, vehicleId: $vehicleId) {
      id
      email
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
    }
  }
`;

const UPDATE_DRIVER_MUTATION = gql`
  mutation UpdateDriver($id: UUID!, $request: UpdateDriverCommandInput!) {
    updateDriver(id: $id, request: $request) {
      id
      email
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
    }
  }
`;

export async function getDrivers(): Promise<Driver[]> {
  const response = await requestGraphQL<GetDriversQuery>(GET_DRIVERS_QUERY);
  return unwrapResult(response.drivers ?? []).map((driver) => normalizeDriver(driver));
}

export async function getDriverById(id: string): Promise<Driver> {
  const response = await requestGraphQL<GetDriverQuery, GetDriverQueryVariables>(GET_DRIVER_QUERY, { id });
  return normalizeDriver(unwrapResult(response.driver));
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const response = await requestGraphQL<GetAvailableDriversQuery>(GET_AVAILABLE_DRIVERS_QUERY);
  return unwrapResult(response.availableDrivers ?? []).map((driver) => normalizeDriver(driver));
}

export async function getDriversWithDetails(
  page = 1,
  pageSize = 15,
  search?: string,
  isActive?: boolean,
): Promise<{ items: DriverDetailsWithUser[]; total: number; page: number; pageSize: number }> {
  const response = await requestGraphQL<GetDriverDetailsQuery, GetDriverDetailsQueryVariables>(
    GET_DRIVER_DETAILS_QUERY,
    { page, pageSize, search, isActive },
  );

  return unwrapResult(response.driverDetails);
}

export async function getMyDriverProfile(): Promise<Driver> {
  const response = await requestGraphQL<GetMyDriverProfileQuery>(GET_MY_DRIVER_PROFILE_QUERY);
  return normalizeDriver(unwrapResult(response.myDriverProfile));
}

export async function registerDriver(payload: RegisterDriverDto): Promise<Driver> {
  const response = await requestGraphQL<RegisterDriverMutation, RegisterDriverMutationVariables>(
    REGISTER_DRIVER_MUTATION,
    { request: payload },
  );

  return normalizeDriver(unwrapResult(response.registerDriver));
}

export async function updateDriverStatus(id: string, payload: UpdateDriverStatusDto): Promise<Driver> {
  const response = await requestGraphQL<UpdateDriverStatusMutation, UpdateDriverStatusMutationVariables>(
    UPDATE_DRIVER_STATUS_MUTATION,
    { id, request: payload },
  );

  return normalizeDriver(unwrapResult(response.updateDriverStatus));
}

export async function assignVehicleToDriver(driverId: string, vehicleId: string | null): Promise<Driver> {
  const response = await requestGraphQL<AssignVehicleToDriverMutation, AssignVehicleToDriverMutationVariables>(
    ASSIGN_VEHICLE_MUTATION,
    { id: driverId, vehicleId },
  );

  return normalizeDriver(unwrapResult(response.assignVehicleToDriver));
}

export async function updateDriver(id: string, payload: { firstName: string; lastName: string; email: string; licenseNumber: string; phone: string }): Promise<Driver> {
  const response = await requestGraphQL<UpdateDriverMutation, UpdateDriverMutationVariables>(
    UPDATE_DRIVER_MUTATION,
    { id, request: payload },
  );

  return normalizeDriver(unwrapResult(response.updateDriver));
}
