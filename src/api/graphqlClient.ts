import { getErrorMessage } from '../lib/errorHandler';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074';

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type AxiosLikeResponse<T> = { data: T };

type RequestConfig = {
  params?: Record<string, any>;
};

type RequestSpec = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
};

const userFields = `
  id
  userName
  firstName
  lastName
  email
  emailConfirmed
  isActive
  roles
  createdAt
`;

const assignedVehicleFields = `
  id
  licensePlate
  make
  model
`;

const driverFields = `
  id
  name
  licenseNumber
  isActive
  applicationUserId
  phone
  email
  assignedVehicleId
  assignedVehicle {
    ${assignedVehicleFields}
  }
`;

const driverDetailsFields = `
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

const vehicleFields = `
  id
  licensePlate
  make
  model
  maxWeightCapacity
  maxVolumeCapacity
  isActive
`;

const locationFields = `
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

const shipmentFields = `
  id
  routeCode
  vehicleId
  driverId
  createdAt
  estimatedDelivery
  shippedAt
  deliveredAt
  arrivedAt
  vehicleMaxWeightCapacity
  vehicleMaxVolumeCapacity
  originLocationId
  originLocationName
  destinationLocationId
  destinationLocationName
  type
  packageIds
  status
`;

const dimensionsFields = `
  lengthCm
  widthCm
  heightCm
  volumeCm3
`;

const recipientFields = `
  name
  address
  phone
  floorApartment
  city
  province
  postalCode
  dni
`;

const packageFields = `
  id
  trackingNumber
  description
  internalCode
  recipient {
    ${recipientFields}
  }
  weight
  createdAt
  lastUpdatedAt
  priority
  applicationUserId
  status
  dimensions {
    ${dimensionsFields}
  }
  originAddress
  destinationAddress
  currentLocationId
`;

const packageDetailFields = `
  ${packageFields}
  currentShipment {
    id
    type
    destinationName
    destinationLocationId
  }
`;

const publicHistoryFields = `
  trackingNumber
  history {
    status
    occurredAt
  }
`;

const internalHistoryFields = `
  id
  packageId
  fromStatus
  toStatus
  occurredAt
  userId
  userName
  firstName
  lastName
  userRoles
  locationId
  shipmentId
  notes
  employeeId
  internalNotes
`;

const scannerFields = `
  id
  trackingNumber
  status
  statusLabel
  weight
  originAddress
  destinationAddress
  recipientName
`;

const pagedUserFields = `items { ${userFields} } total page pageSize`;
const pagedDriverDetailsFields = `items { ${driverDetailsFields} } total page pageSize`;
const pagedShipmentFields = `items { ${shipmentFields} } total page pageSize`;
const pagedPackageFields = `items { ${packageFields} } totalCount pageNumber pageSize totalPages hasNextPage hasPreviousPage`;

const gql = {
  getUsers: `query GetUsers($page: Int!, $pageSize: Int!) { getUsers(page: $page, pageSize: $pageSize) { ${pagedUserFields} } }`,
  getUser: `query GetUser($id: ID!) { getUser(id: $id) { ${userFields} } }`,
  createUser: `mutation CreateUser($firstName: String!, $lastName: String!, $email: String!, $password: String!) { createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) { ${userFields} } }`,
  updateUser: `mutation UpdateUser($id: ID!, $firstName: String, $lastName: String, $email: String, $roles: [String!]) { updateUser(id: $id, firstName: $firstName, lastName: $lastName, email: $email, roles: $roles) { ${userFields} } }`,
  toggleUserStatus: `mutation ToggleUserStatus($id: ID!, $isActive: Boolean!) { toggleUserStatus(id: $id, isActive: $isActive) }`,
  register: `mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!, $roles: [String!]) { register(firstName: $firstName, lastName: $lastName, email: $email, password: $password, roles: $roles) { ${userFields} } }`,
  login: `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token refreshToken user { ${userFields} } } }`,
  refresh: `mutation Refresh($refreshToken: String) { refresh(refreshToken: $refreshToken) { token refreshToken user { ${userFields} } } }`,
  getLocations: `query GetLocations { getLocations { ${locationFields} } }`,
  createLocation: `mutation CreateLocation($request: CreateLocationCommandInput!) { createLocation(request: $request) { ${locationFields} } }`,
  getDrivers: `query GetDrivers { getDrivers { ${driverFields} } }`,
  getAvailableDrivers: `query GetAvailableDrivers { getAvailableDrivers { ${driverFields} } }`,
  getDriverDetails: `query GetDriverDetails($page: Int!, $pageSize: Int!, $search: String, $isActive: Boolean) { getDriverDetails(page: $page, pageSize: $pageSize, search: $search, isActive: $isActive) { ${pagedDriverDetailsFields} } }`,
  getDriver: `query GetDriver($id: ID!) { getDriver(id: $id) { ${driverFields} } }`,
  getMyDriverProfile: `query GetMyDriverProfile { getMyDriverProfile { ${driverFields} } }`,
  registerDriver: `mutation RegisterDriver($request: RegisterDriverCommandInput!) { registerDriver(request: $request) { ${driverFields} } }`,
  updateDriver: `mutation UpdateDriver($id: ID!, $request: UpdateDriverCommandInput!) { updateDriver(id: $id, request: $request) { ${driverFields} } }`,
  updateDriverStatus: `mutation UpdateDriverStatus($id: ID!, $request: UpdateDriverStatusCommandInput!) { updateDriverStatus(id: $id, request: $request) { ${driverFields} } }`,
  assignVehicleToDriver: `mutation AssignVehicleToDriver($id: ID!, $vehicleId: ID) { assignVehicleToDriver(id: $id, vehicleId: $vehicleId) { ${driverFields} } }`,
  getVehicles: `query GetVehicles { getVehicles { ${vehicleFields} } }`,
  getAvailableVehicles: `query GetAvailableVehicles { getAvailableVehicles { ${vehicleFields} } }`,
  getVehicle: `query GetVehicle($id: ID!) { getVehicle(id: $id) { ${vehicleFields} } }`,
  createVehicle: `mutation CreateVehicle($request: CreateVehicleDtoInput!) { createVehicle(request: $request) { ${vehicleFields} } }`,
  updateVehicle: `mutation UpdateVehicle($id: ID!, $request: UpdateVehicleDtoInput!) { updateVehicle(id: $id, request: $request) { ${vehicleFields} } }`,
  updateVehicleStatus: `mutation UpdateVehicleStatus($id: ID!, $request: UpdateVehicleStatusDtoInput!) { updateVehicleStatus(id: $id, request: $request) { ${vehicleFields} } }`,
  deleteVehicle: `mutation DeleteVehicle($id: ID!) { deleteVehicle(id: $id) }`,
  getShipments: `query GetShipments($page: Int!, $pageSize: Int!, $sortBy: String, $sortDir: String, $status: String, $q: String) { getShipments(page: $page, pageSize: $pageSize, sortBy: $sortBy, sortDir: $sortDir, status: $status, q: $q) { ${pagedShipmentFields} } }`,
  getMyShipments: `query GetMyShipments { getMyShipments { ${shipmentFields} } }`,
  getShipment: `query GetShipment($id: ID!) { getShipment(id: $id) { ${shipmentFields} } }`,
  createShipment: `mutation CreateShipment($request: CreateShipmentCommandInput!) { createShipment(request: $request) { ${shipmentFields} } }`,
  addPackageToShipment: `mutation AddPackageToShipment($shipmentId: ID!, $packageId: ID!) { addPackageToShipment(shipmentId: $shipmentId, packageId: $packageId) { ${shipmentFields} } }`,
  addPackagesToShipment: `mutation AddPackagesToShipment($shipmentId: ID!, $packageIds: [ID!]!) { addPackagesToShipment(shipmentId: $shipmentId, packageIds: $packageIds) }`,
  dispatchShipment: `mutation DispatchShipment($shipmentId: ID!) { dispatchShipment(shipmentId: $shipmentId) }`,
  startShipment: `mutation StartShipment($shipmentId: ID!) { startShipment(shipmentId: $shipmentId) }`,
  assignDriverToShipment: `mutation AssignDriverToShipment($shipmentId: ID!, $driverId: ID!) { assignDriverToShipment(shipmentId: $shipmentId, driverId: $driverId) }`,
  arriveShipment: `mutation ArriveShipment($shipmentId: ID!) { arriveShipment(shipmentId: $shipmentId) }`,
  completeShipment: `mutation CompleteShipment($shipmentId: ID!) { completeShipment(shipmentId: $shipmentId) }`,
  finalizeShipment: `mutation FinalizeShipment($shipmentId: ID!) { finalizeShipment(shipmentId: $shipmentId) }`,
  cancelShipment: `mutation CancelShipment($shipmentId: ID!) { cancelShipment(shipmentId: $shipmentId) }`,
  getPackages: `query GetPackages($page: Int!, $pageSize: Int!) { getPackages(page: $page, pageSize: $pageSize) { ${pagedPackageFields} } }`,
  getPackage: `query GetPackage($id: ID!) { getPackage(id: $id) { ${packageDetailFields} } }`,
  createPackage: `mutation CreatePackage($request: CreatePackageCommandInput!) { createPackage(request: $request) { ${packageFields} } }`,
  updatePackage: `mutation UpdatePackage($id: ID!, $request: UpdatePackageCommandInput!) { updatePackage(id: $id, request: $request) { ${packageFields} } }`,
  deliverPackage: `mutation DeliverPackage($id: ID!) { deliverPackage(id: $id) { ${packageFields} } }`,
  collectPackage: `mutation CollectPackage($id: ID!) { collectPackage(id: $id) }`,
  cancelPackage: `mutation CancelPackage($id: ID!) { cancelPackage(id: $id) { ${packageFields} } }`,
  movePackageToDepot: `mutation MovePackageToDepot($id: ID!) { movePackageToDepot(id: $id) }`,
  markPackageAsDelivered: `mutation MarkPackageAsDelivered($id: ID!, $latitude: Float, $longitude: Float, $deliveryNotes: String) { markPackageAsDelivered(id: $id, latitude: $latitude, longitude: $longitude, deliveryNotes: $deliveryNotes) }`,
  markPackageAsCollected: `mutation MarkPackageAsCollected($id: ID!, $collectionNotes: String) { markPackageAsCollected(id: $id, collectionNotes: $collectionNotes) }`,
  markPackageAttemptFailed: `mutation MarkPackageAttemptFailed($id: ID!, $reason: String) { markPackageAttemptFailed(id: $id, reason: $reason) }`,
  getPackageByTracking: `query GetPackageByTracking($trackingNumber: String!) { getPackageByTracking(trackingNumber: $trackingNumber) { ${publicHistoryFields} } }`,
  getPackageHistory: `query GetPackageHistory($id: ID!) { getPackageHistory(id: $id) { ${internalHistoryFields} } }`,
  getPackageForScannerByTracking: `query GetPackageForScannerByTracking($trackingNumber: String!) { getPackageForScannerByTracking(trackingNumber: $trackingNumber) { ${scannerFields} } }`,
  getPackageForScanner: `query GetPackageForScanner($id: ID!) { getPackageForScanner(id: $id) { ${scannerFields} } }`,
  getAddressSuggestions: `query GetAddressSuggestions($q: String!) { getAddressSuggestions(q: $q) }`,
  recordSelectedAddress: `mutation RecordSelectedAddress($address: String!) { recordSelectedAddress(address: $address) }`,
} as const;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (err?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) item.reject(error);
    else item.resolve(token);
  });
  failedQueue = [];
};

const buildWrapper = <T>(value: T, isSuccess = true, error: string | null = null, type = 0) => ({
  isSuccess,
  value: isSuccess ? value : null,
  error,
  type,
  responseTime: new Date().toISOString(),
});

const classifyErrorType = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes('unauthorized') || normalized.includes('forbidden')) return 4;
  if (normalized.includes('not found')) return 2;
  if (normalized.includes('conflict')) return 3;
  return 1;
};

const makeError = (message: string, status = 400) => {
  const error: any = new Error(message);
  error.response = {
    status,
    data: { error: message, message },
  };
  error.userMessage = message;
  return error;
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const storeToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
};

const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const isAuthError = (message: string) => /unauthorized|forbidden/i.test(message);

async function executeGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseURL}/graphql`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GraphQLResponse<any>;
  if (json.errors?.length) {
    const message = json.errors[0].message ?? 'Request failed';
    throw makeError(message, isAuthError(message) ? 401 : 400);
  }

  return json.data as T;
}

async function executeWithRefresh<T>(spec: RequestSpec, execute: () => Promise<T>): Promise<T> {
  try {
    return await execute();
  } catch (error: any) {
    const message = getErrorMessage(error);
    if (!isAuthError(message) || spec.url === '/api/auth/refresh') {
      throw error;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => execute()) as Promise<T>;
    }

    isRefreshing = true;
    try {
      const refreshResult = await executeGraphQL<{ refresh: { token: string; refreshToken?: string; user: any } }>(gql.refresh, {
        refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
      });

      const newToken = refreshResult.refresh?.token;
      if (!newToken) throw makeError('Refresh failed', 401);

      storeToken(newToken);
      processQueue(null, newToken);
      return await execute();
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
}

const route = (spec: RequestSpec) => {
  const { method, url, data, params } = spec;

  if (method === 'GET' && url === '/api/users') {
    return { query: gql.getUsers, variables: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 15 }, field: 'getUsers' };
  }
  if (method === 'GET' && /^\/api\/users\/[^/]+$/.test(url)) {
    return { query: gql.getUser, variables: { id: url.split('/').pop() }, field: 'getUser' };
  }
  if (method === 'POST' && url === '/api/users') {
    return { query: gql.createUser, variables: { firstName: data?.firstName, lastName: data?.lastName, email: data?.email, password: data?.password }, field: 'createUser' };
  }
  if (method === 'PUT' && /^\/api\/users\/[^/]+$/.test(url)) {
    return { query: gql.updateUser, variables: { id: url.split('/').pop(), firstName: data?.firstName, lastName: data?.lastName, email: data?.email, roles: data?.roles }, field: 'updateUser' };
  }
  if (method === 'PATCH' && /^\/api\/users\/[^/]+\/status$/.test(url)) {
    return { query: gql.toggleUserStatus, variables: { id: url.split('/')[3], isActive: data?.isActive }, field: 'toggleUserStatus' };
  }

  if (method === 'POST' && url === '/api/auth/register') {
    return { query: gql.register, variables: data, field: 'register' };
  }
  if (method === 'POST' && url === '/api/auth/login') {
    return { query: gql.login, variables: { email: data?.Email ?? data?.email, password: data?.Password ?? data?.password }, field: 'login' };
  }
  if (method === 'POST' && url === '/api/auth/refresh') {
    return { query: gql.refresh, variables: { refreshToken: data?.RefreshToken ?? data?.refreshToken ?? null }, field: 'refresh' };
  }

  if (method === 'GET' && url === '/api/locations') {
    return { query: gql.getLocations, variables: {}, field: 'getLocations' };
  }
  if (method === 'POST' && url === '/api/locations') {
    return { query: gql.createLocation, variables: { request: data }, field: 'createLocation' };
  }

  if (method === 'GET' && url === '/api/drivers') {
    return { query: gql.getDrivers, variables: {}, field: 'getDrivers' };
  }
  if (method === 'GET' && url === '/api/drivers/available') {
    return { query: gql.getAvailableDrivers, variables: {}, field: 'getAvailableDrivers' };
  }
  if (method === 'GET' && url === '/api/drivers/details') {
    return { query: gql.getDriverDetails, variables: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 15, search: params?.search ?? null, isActive: params?.isActive ?? null }, field: 'getDriverDetails' };
  }
  if (method === 'GET' && url === '/api/drivers/me') {
    return { query: gql.getMyDriverProfile, variables: {}, field: 'getMyDriverProfile' };
  }
  if (method === 'GET' && /^\/api\/drivers\/[^/]+$/.test(url)) {
    return { query: gql.getDriver, variables: { id: url.split('/').pop() }, field: 'getDriver' };
  }
  if (method === 'POST' && url === '/api/drivers/register') {
    return { query: gql.registerDriver, variables: { request: data }, field: 'registerDriver' };
  }
  if (method === 'PUT' && /^\/api\/drivers\/[^/]+\/status$/.test(url)) {
    return { query: gql.updateDriverStatus, variables: { id: url.split('/')[3], request: data }, field: 'updateDriverStatus' };
  }
  if (method === 'PUT' && /^\/api\/drivers\/[^/]+\/assign-vehicle$/.test(url)) {
    return { query: gql.assignVehicleToDriver, variables: { id: url.split('/')[3], vehicleId: data?.VehicleId ?? data?.vehicleId ?? null }, field: 'assignVehicleToDriver' };
  }
  if (method === 'PUT' && /^\/api\/drivers\/[^/]+$/.test(url)) {
    return { query: gql.updateDriver, variables: { id: url.split('/').pop(), request: data }, field: 'updateDriver' };
  }

  if (method === 'GET' && url === '/api/vehicles') {
    return { query: gql.getVehicles, variables: {}, field: 'getVehicles' };
  }
  if (method === 'GET' && url === '/api/vehicles/available') {
    return { query: gql.getAvailableVehicles, variables: {}, field: 'getAvailableVehicles' };
  }
  if (method === 'GET' && /^\/api\/vehicles\/[^/]+$/.test(url)) {
    return { query: gql.getVehicle, variables: { id: url.split('/').pop() }, field: 'getVehicle' };
  }
  if (method === 'POST' && url === '/api/vehicles') {
    return { query: gql.createVehicle, variables: { request: data }, field: 'createVehicle' };
  }
  if (method === 'PUT' && /^\/api\/vehicles\/[^/]+$/.test(url)) {
    return { query: gql.updateVehicle, variables: { id: url.split('/').pop(), request: data }, field: 'updateVehicle' };
  }
  if (method === 'PATCH' && /^\/api\/vehicles\/[^/]+\/status$/.test(url)) {
    return { query: gql.updateVehicleStatus, variables: { id: url.split('/')[3], request: data }, field: 'updateVehicleStatus' };
  }
  if (method === 'DELETE' && /^\/api\/vehicles\/[^/]+$/.test(url)) {
    return { query: gql.deleteVehicle, variables: { id: url.split('/').pop() }, field: 'deleteVehicle' };
  }

  if (method === 'GET' && url === '/api/shipments') {
    return { query: gql.getShipments, variables: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10, sortBy: params?.sortBy ?? null, sortDir: params?.sortDir ?? null, status: params?.status ?? null, q: params?.q ?? null }, field: 'getShipments' };
  }
  if (method === 'GET' && url === '/api/shipments/me') {
    return { query: gql.getMyShipments, variables: {}, field: 'getMyShipments' };
  }
  if (method === 'GET' && /^\/api\/shipments\/[^/]+$/.test(url)) {
    return { query: gql.getShipment, variables: { id: url.split('/').pop() }, field: 'getShipment' };
  }
  if (method === 'POST' && url === '/api/shipments') {
    return { query: gql.createShipment, variables: { request: data }, field: 'createShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/packages$/.test(url)) {
    return { query: gql.addPackageToShipment, variables: { shipmentId: url.split('/')[3], packageId: data?.packageId ?? data?.PackageId }, field: 'addPackageToShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/add-packages$/.test(url)) {
    return { query: gql.addPackagesToShipment, variables: { shipmentId: url.split('/')[3], packageIds: data }, field: 'addPackagesToShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/dispatch$/.test(url)) {
    return { query: gql.dispatchShipment, variables: { shipmentId: url.split('/')[3] }, field: 'dispatchShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/start$/.test(url)) {
    return { query: gql.startShipment, variables: { shipmentId: url.split('/')[3] }, field: 'startShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/assign-driver$/.test(url)) {
    return { query: gql.assignDriverToShipment, variables: { shipmentId: url.split('/')[3], driverId: data?.driverId ?? data?.DriverId }, field: 'assignDriverToShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/arrive$/.test(url)) {
    return { query: gql.arriveShipment, variables: { shipmentId: url.split('/')[3] }, field: 'arriveShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/complete$/.test(url)) {
    return { query: gql.completeShipment, variables: { shipmentId: url.split('/')[3] }, field: 'completeShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/finalize$/.test(url)) {
    return { query: gql.finalizeShipment, variables: { shipmentId: url.split('/')[3] }, field: 'finalizeShipment' };
  }
  if (method === 'POST' && /^\/api\/shipments\/[^/]+\/cancel$/.test(url)) {
    return { query: gql.cancelShipment, variables: { shipmentId: url.split('/')[3] }, field: 'cancelShipment' };
  }

  if (method === 'GET' && url === '/api/packages') {
    return { query: gql.getPackages, variables: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 }, field: 'getPackages' };
  }
  if (method === 'GET' && /^\/api\/packages\/scanner\/tracking\/[^/]+$/.test(url)) {
    return { query: gql.getPackageForScannerByTracking, variables: { trackingNumber: url.split('/').pop() }, field: 'getPackageForScannerByTracking' };
  }
  if (method === 'GET' && /^\/api\/packages\/scanner\/[^/]+$/.test(url)) {
    return { query: gql.getPackageForScanner, variables: { id: url.split('/').pop() }, field: 'getPackageForScanner' };
  }
  if (method === 'GET' && /^\/api\/packages\/tracking\/[^/]+$/.test(url)) {
    return { query: gql.getPackageByTracking, variables: { trackingNumber: url.split('/').pop() }, field: 'getPackageByTracking' };
  }
  if (method === 'GET' && /^\/api\/packages\/[^/]+\/history$/.test(url)) {
    return { query: gql.getPackageHistory, variables: { id: url.split('/')[3] }, field: 'getPackageHistory' };
  }
  if (method === 'GET' && /^\/api\/packages\/[^/]+$/.test(url)) {
    return { query: gql.getPackage, variables: { id: url.split('/').pop() }, field: 'getPackage' };
  }
  if (method === 'POST' && url === '/api/packages') {
    return { query: gql.createPackage, variables: { request: data }, field: 'createPackage' };
  }
  if (method === 'PUT' && /^\/api\/packages\/[^/]+$/.test(url)) {
    return { query: gql.updatePackage, variables: { id: url.split('/').pop(), request: data }, field: 'updatePackage' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/deliver$/.test(url)) {
    return { query: gql.deliverPackage, variables: { id: url.split('/')[3] }, field: 'deliverPackage' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/collect$/.test(url)) {
    return { query: gql.collectPackage, variables: { id: url.split('/')[3] }, field: 'collectPackage' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/cancel$/.test(url)) {
    return { query: gql.cancelPackage, variables: { id: url.split('/')[3] }, field: 'cancelPackage' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/move-to-depot$/.test(url)) {
    return { query: gql.movePackageToDepot, variables: { id: url.split('/')[3] }, field: 'movePackageToDepot' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/mark-delivered$/.test(url)) {
    return { query: gql.markPackageAsDelivered, variables: { id: url.split('/')[3], latitude: data?.deliveryLatitude ?? data?.Latitude ?? null, longitude: data?.deliveryLongitude ?? data?.Longitude ?? null, deliveryNotes: data?.deliveryNotes ?? data?.DeliveryNotes ?? null }, field: 'markPackageAsDelivered' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/mark-collected$/.test(url)) {
    return { query: gql.markPackageAsCollected, variables: { id: url.split('/')[3], collectionNotes: data?.collectionNotes ?? data?.CollectionNotes ?? null }, field: 'markPackageAsCollected' };
  }
  if (method === 'POST' && /^\/api\/packages\/[^/]+\/mark-attempt-failed$/.test(url)) {
    return { query: gql.markPackageAttemptFailed, variables: { id: url.split('/')[3], reason: data?.reason ?? data?.Reason ?? null }, field: 'markPackageAttemptFailed' };
  }

  if (method === 'GET' && url === '/api/addresses/autocomplete') {
    return { query: gql.getAddressSuggestions, variables: { q: params?.q ?? '' }, field: 'getAddressSuggestions' };
  }
  if (method === 'POST' && url === '/api/addresses/selected') {
    return { query: gql.recordSelectedAddress, variables: { address: data?.address ?? data?.Address ?? '' }, field: 'recordSelectedAddress' };
  }

  throw makeError(`Unsupported request: ${method} ${url}`, 400);
};

async function dispatch(spec: RequestSpec): Promise<AxiosLikeResponse<any>> {
  const routeConfig = route(spec);

  const run = async () => {
    const response = await executeGraphQL<any>(routeConfig.query, routeConfig.variables);
    const value = response?.[routeConfig.field];
    return { data: buildWrapper(value) };
  };

  try {
    return await executeWithRefresh(spec, run);
  } catch (error: any) {
    const message = getErrorMessage(error);
    return { data: { isSuccess: false, value: null, error: message, type: classifyErrorType(message), responseTime: new Date().toISOString() } };
  }
}

const api = {
  get: (url: string, config?: RequestConfig) => dispatch({ method: 'GET', url, params: config?.params }),
  post: (url: string, data?: any, config?: RequestConfig) => dispatch({ method: 'POST', url, data, params: config?.params }),
  put: (url: string, data?: any, config?: RequestConfig) => dispatch({ method: 'PUT', url, data, params: config?.params }),
  patch: (url: string, data?: any, config?: RequestConfig) => dispatch({ method: 'PATCH', url, data, params: config?.params }),
  delete: (url: string, config?: RequestConfig) => dispatch({ method: 'DELETE', url, params: config?.params }),
};

export default api;