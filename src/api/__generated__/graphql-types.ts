/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  Decimal: { input: number; output: number; }
  UUID: { input: string; output: string; }
};

export type AssignedVehicleInfoDto = {
  id: Scalars['UUID']['output'];
  licensePlate?: Maybe<Scalars['String']['output']>;
  make?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
};

export type AuthResponseDto = {
  refreshToken?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  user: UserDto;
};

export type CreateLocationCommandInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  name: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePackageCommandInput = {
  description: Scalars['String']['input'];
  destination: Scalars['String']['input'];
  heightCm: Scalars['Decimal']['input'];
  internalCode: Scalars['String']['input'];
  lengthCm: Scalars['Decimal']['input'];
  origin: Scalars['String']['input'];
  priority: PackagePriority;
  recipientAddress: Scalars['String']['input'];
  recipientCity: Scalars['String']['input'];
  recipientDni: Scalars['String']['input'];
  recipientFloorApartment: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  recipientPostalCode: Scalars['String']['input'];
  recipientProvince: Scalars['String']['input'];
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
  weight: Scalars['Decimal']['input'];
  widthCm: Scalars['Decimal']['input'];
};

export type CreateShipmentCommandInput = {
  destinationLocationId?: InputMaybe<Scalars['Int']['input']>;
  driverId: Scalars['UUID']['input'];
  estimatedDelivery: Scalars['DateTime']['input'];
  originLocationId?: InputMaybe<Scalars['Int']['input']>;
  packageIds: Array<Scalars['UUID']['input']>;
  type?: InputMaybe<ShipmentType>;
  vehicleId: Scalars['UUID']['input'];
};

export type CreateVehicleDtoInput = {
  make?: InputMaybe<Scalars['String']['input']>;
  maxVolumeCapacity: Scalars['Decimal']['input'];
  maxWeightCapacity: Scalars['Decimal']['input'];
  model?: InputMaybe<Scalars['String']['input']>;
  plate: Scalars['String']['input'];
};

export type CurrentShipmentDto = {
  destinationLocationId?: Maybe<Scalars['Int']['output']>;
  destinationName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  type: ShipmentType;
};

export type DimensionsDto = {
  heightCm: Scalars['Decimal']['output'];
  lengthCm: Scalars['Decimal']['output'];
  volumeCm3: Scalars['Decimal']['output'];
  widthCm: Scalars['Decimal']['output'];
};

export type DriverDetailsWithUserDto = {
  assignedVehicleId?: Maybe<Scalars['UUID']['output']>;
  assignedVehicleMake?: Maybe<Scalars['String']['output']>;
  assignedVehicleModel?: Maybe<Scalars['String']['output']>;
  assignedVehiclePlate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  driverId?: Maybe<Scalars['UUID']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  insuranceExpiry: Scalars['DateTime']['output'];
  isUserActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  licenseExpiry: Scalars['DateTime']['output'];
  licenseNumber: Scalars['String']['output'];
  licenseType: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['String']['output'];
};

export type DriverDto = {
  applicationUserId?: Maybe<Scalars['String']['output']>;
  assignedVehicle?: Maybe<AssignedVehicleInfoDto>;
  assignedVehicleId?: Maybe<Scalars['UUID']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  licenseNumber: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type LocationDto = {
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  addPackageToShipment: ShipmentDto;
  addPackagesToShipment: Scalars['Boolean']['output'];
  arriveShipment: Scalars['Boolean']['output'];
  assignDriverToShipment: Scalars['Boolean']['output'];
  assignVehicleToDriver: DriverDto;
  cancelPackage: PackageDto;
  cancelShipment: Scalars['Boolean']['output'];
  collectPackage: Scalars['Boolean']['output'];
  completeShipment: Scalars['Boolean']['output'];
  createLocation: LocationDto;
  createPackage: PackageDto;
  createShipment: ShipmentDto;
  createUser: UserDto;
  createVehicle: VehicleDto;
  deleteVehicle: Scalars['Boolean']['output'];
  deliverPackage: PackageDto;
  dispatchShipment: Scalars['Boolean']['output'];
  finalizeShipment: Scalars['Boolean']['output'];
  login: AuthResponseDto;
  markPackageAsCollected: Scalars['Boolean']['output'];
  markPackageAsDelivered: Scalars['Boolean']['output'];
  markPackageAttemptFailed: Scalars['Boolean']['output'];
  movePackageToDepot: Scalars['Boolean']['output'];
  recordSelectedAddress: Scalars['Boolean']['output'];
  refresh: AuthResponseDto;
  register: UserDto;
  registerDriver: DriverDto;
  startShipment: Scalars['Boolean']['output'];
  toggleUserStatus: Scalars['Boolean']['output'];
  updateDriver: DriverDto;
  updateDriverStatus: DriverDto;
  updatePackage: PackageDto;
  updateUser: UserDto;
  updateVehicle: VehicleDto;
  updateVehicleStatus: VehicleDto;
};


export type MutationAddPackageToShipmentArgs = {
  packageId: Scalars['UUID']['input'];
  shipmentId: Scalars['UUID']['input'];
};


export type MutationAddPackagesToShipmentArgs = {
  packageIds: Array<Scalars['UUID']['input']>;
  shipmentId: Scalars['UUID']['input'];
};


export type MutationArriveShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationAssignDriverToShipmentArgs = {
  driverId: Scalars['UUID']['input'];
  shipmentId: Scalars['UUID']['input'];
};


export type MutationAssignVehicleToDriverArgs = {
  id: Scalars['UUID']['input'];
  vehicleId?: InputMaybe<Scalars['UUID']['input']>;
};


export type MutationCancelPackageArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationCancelShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationCollectPackageArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationCompleteShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationCreateLocationArgs = {
  request: CreateLocationCommandInput;
};


export type MutationCreatePackageArgs = {
  request: CreatePackageCommandInput;
};


export type MutationCreateShipmentArgs = {
  request: CreateShipmentCommandInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationCreateVehicleArgs = {
  request: CreateVehicleDtoInput;
};


export type MutationDeleteVehicleArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDeliverPackageArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationDispatchShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationFinalizeShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMarkPackageAsCollectedArgs = {
  collectionNotes?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
};


export type MutationMarkPackageAsDeliveredArgs = {
  deliveryNotes?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  latitude?: InputMaybe<Scalars['Decimal']['input']>;
  longitude?: InputMaybe<Scalars['Decimal']['input']>;
};


export type MutationMarkPackageAttemptFailedArgs = {
  id: Scalars['UUID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMovePackageToDepotArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationRecordSelectedAddressArgs = {
  address: Scalars['String']['input'];
};


export type MutationRefreshArgs = {
  refreshToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationRegisterDriverArgs = {
  request: RegisterDriverCommandInput;
};


export type MutationStartShipmentArgs = {
  shipmentId: Scalars['UUID']['input'];
};


export type MutationToggleUserStatusArgs = {
  id: Scalars['UUID']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationUpdateDriverArgs = {
  id: Scalars['UUID']['input'];
  request: UpdateDriverCommandInput;
};


export type MutationUpdateDriverStatusArgs = {
  id: Scalars['UUID']['input'];
  request: UpdateDriverStatusCommandInput;
};


export type MutationUpdatePackageArgs = {
  id: Scalars['UUID']['input'];
  request: UpdatePackageCommandInput;
};


export type MutationUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateVehicleArgs = {
  id: Scalars['UUID']['input'];
  request: UpdateVehicleDtoInput;
};


export type MutationUpdateVehicleStatusArgs = {
  id: Scalars['UUID']['input'];
  request: UpdateVehicleStatusDtoInput;
};

export type PackageDetailDto = {
  applicationUserId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentLocationId?: Maybe<Scalars['Int']['output']>;
  currentShipment?: Maybe<CurrentShipmentDto>;
  description?: Maybe<Scalars['String']['output']>;
  destinationAddress?: Maybe<Scalars['String']['output']>;
  dimensions?: Maybe<DimensionsDto>;
  id: Scalars['UUID']['output'];
  internalCode?: Maybe<Scalars['String']['output']>;
  lastUpdatedAt: Scalars['DateTime']['output'];
  originAddress?: Maybe<Scalars['String']['output']>;
  priority: PackagePriority;
  recipient: RecipientDto;
  status: PackageStatus;
  trackingNumber: Scalars['String']['output'];
  weight: Scalars['Decimal']['output'];
};

export type PackageDto = {
  applicationUserId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentLocationId?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  destinationAddress?: Maybe<Scalars['String']['output']>;
  dimensions?: Maybe<DimensionsDto>;
  id: Scalars['UUID']['output'];
  internalCode?: Maybe<Scalars['String']['output']>;
  lastUpdatedAt: Scalars['DateTime']['output'];
  originAddress?: Maybe<Scalars['String']['output']>;
  priority: PackagePriority;
  recipient: RecipientDto;
  status: PackageStatus;
  trackingNumber: Scalars['String']['output'];
  weight: Scalars['Decimal']['output'];
};

export type PackageForScannerDto = {
  destinationAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  originAddress?: Maybe<Scalars['String']['output']>;
  recipientName?: Maybe<Scalars['String']['output']>;
  status: Scalars['Int']['output'];
  statusLabel: Scalars['String']['output'];
  trackingNumber: Scalars['String']['output'];
  weight: Scalars['Decimal']['output'];
};

export type PackageInternalHistoryDto = {
  employeeId?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fromStatus: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  internalNotes?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  locationId?: Maybe<Scalars['Int']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  occurredAt: Scalars['DateTime']['output'];
  packageId: Scalars['UUID']['output'];
  shipmentId?: Maybe<Scalars['UUID']['output']>;
  toStatus: Scalars['String']['output'];
  userId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
  userRoles?: Maybe<Scalars['String']['output']>;
};

export enum PackagePriority {
  Economic = 'ECONOMIC',
  Express = 'EXPRESS',
  Standard = 'STANDARD'
}

export type PackagePublicHistoryDto = {
  history: Array<PublicHistoryEntryDto>;
  trackingNumber: Scalars['String']['output'];
};

export enum PackageStatus {
  AtDepot = 'AT_DEPOT',
  Canceled = 'CANCELED',
  Collected = 'COLLECTED',
  Delivered = 'DELIVERED',
  DeliveredToCenter = 'DELIVERED_TO_CENTER',
  InTransit = 'IN_TRANSIT',
  LastMile = 'LAST_MILE',
  Pending = 'PENDING',
  Returned = 'RETURNED'
}

export type PagedResponseOfPackageDto = {
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  items: Array<PackageDto>;
  pageNumber: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PagedResultDtoOfShipmentDto = {
  items: Array<ShipmentDto>;
  total: Scalars['Int']['output'];
};

export type PagedResultOfDriverDetailsWithUserDto = {
  items: Array<DriverDetailsWithUserDto>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PagedResultOfUserDto = {
  items: Array<UserDto>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PublicHistoryEntryDto = {
  occurredAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
};

export type Query = {
  addressSuggestions: Array<Scalars['String']['output']>;
  availableDrivers: Array<DriverDto>;
  availableVehicles: Array<VehicleDto>;
  driver?: Maybe<DriverDto>;
  driverDetails: PagedResultOfDriverDetailsWithUserDto;
  drivers: Array<DriverDto>;
  locations: Array<LocationDto>;
  myDriverProfile?: Maybe<DriverDto>;
  myShipments: Array<ShipmentDto>;
  package?: Maybe<PackageDetailDto>;
  packageByTracking?: Maybe<PackagePublicHistoryDto>;
  packageForScanner?: Maybe<PackageForScannerDto>;
  packageForScannerByTracking?: Maybe<PackageForScannerDto>;
  packageHistory: Array<PackageInternalHistoryDto>;
  packages: PagedResponseOfPackageDto;
  shipment?: Maybe<ShipmentDto>;
  shipments: PagedResultDtoOfShipmentDto;
  user?: Maybe<UserDto>;
  users: PagedResultOfUserDto;
  vehicle?: Maybe<VehicleDto>;
  vehicles: Array<VehicleDto>;
};


export type QueryAddressSuggestionsArgs = {
  q: Scalars['String']['input'];
};


export type QueryDriverArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryDriverDetailsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPackageArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryPackageByTrackingArgs = {
  trackingNumber: Scalars['String']['input'];
};


export type QueryPackageForScannerArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryPackageForScannerByTrackingArgs = {
  trackingNumber: Scalars['String']['input'];
};


export type QueryPackageHistoryArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryPackagesArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
};


export type QueryShipmentArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryShipmentsArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  q?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDir?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryUsersArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
};


export type QueryVehicleArgs = {
  id: Scalars['UUID']['input'];
};

export type RecipientDto = {
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  dni?: Maybe<Scalars['String']['output']>;
  floorApartment?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
};

export type RegisterDriverCommandInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  licenseNumber: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type ShipmentDto = {
  arrivedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  destinationLocationId?: Maybe<Scalars['Int']['output']>;
  destinationLocationName?: Maybe<Scalars['String']['output']>;
  driverId?: Maybe<Scalars['UUID']['output']>;
  estimatedDelivery: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  originLocationId?: Maybe<Scalars['Int']['output']>;
  originLocationName?: Maybe<Scalars['String']['output']>;
  packageIds: Array<Scalars['UUID']['output']>;
  routeCode: Scalars['String']['output'];
  shippedAt?: Maybe<Scalars['DateTime']['output']>;
  status: ShipmentStatus;
  type?: Maybe<ShipmentType>;
  vehicleId: Scalars['UUID']['output'];
  vehicleMaxVolumeCapacity: Scalars['Decimal']['output'];
  vehicleMaxWeightCapacity: Scalars['Decimal']['output'];
};

export enum ShipmentStatus {
  Arrived = 'ARRIVED',
  Canceled = 'CANCELED',
  Delivered = 'DELIVERED',
  Dispatched = 'DISPATCHED',
  Draft = 'DRAFT',
  Loading = 'LOADING'
}

export enum ShipmentType {
  LastMile = 'LAST_MILE',
  Pickup = 'PICKUP',
  Transfer = 'TRANSFER'
}

export type UpdateDriverCommandInput = {
  driverId: Scalars['UUID']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDriverStatusCommandInput = {
  driverId: Scalars['UUID']['input'];
  isActive: Scalars['Boolean']['input'];
};

export type UpdatePackageCommandInput = {
  id: Scalars['UUID']['input'];
  recipientAddress?: InputMaybe<Scalars['String']['input']>;
  recipientCity?: InputMaybe<Scalars['String']['input']>;
  recipientDni?: InputMaybe<Scalars['String']['input']>;
  recipientFloorApartment?: InputMaybe<Scalars['String']['input']>;
  recipientName?: InputMaybe<Scalars['String']['input']>;
  recipientPhone?: InputMaybe<Scalars['String']['input']>;
  recipientPostalCode?: InputMaybe<Scalars['String']['input']>;
  recipientProvince?: InputMaybe<Scalars['String']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Decimal']['input']>;
};

export type UpdateVehicleDtoInput = {
  isActive: Scalars['Boolean']['input'];
  make?: InputMaybe<Scalars['String']['input']>;
  maxVolumeCapacity: Scalars['Decimal']['input'];
  maxWeightCapacity: Scalars['Decimal']['input'];
  model?: InputMaybe<Scalars['String']['input']>;
  plate: Scalars['String']['input'];
};

export type UpdateVehicleStatusDtoInput = {
  status: Scalars['String']['input'];
};

export type UserDto = {
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailConfirmed: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  roles?: Maybe<Array<Scalars['String']['output']>>;
  userName: Scalars['String']['output'];
};

export type VehicleDto = {
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  licensePlate?: Maybe<Scalars['String']['output']>;
  make?: Maybe<Scalars['String']['output']>;
  maxVolumeCapacity: Scalars['Decimal']['output'];
  maxWeightCapacity: Scalars['Decimal']['output'];
  model?: Maybe<Scalars['String']['output']>;
};

export type CreateLocationCommandInput = {
  addressLine1: string;
  addressLine2?: string | null | undefined;
  city: string;
  country: string;
  name: string;
  postalCode: string;
  state?: string | null | undefined;
};

export type CreateShipmentCommandInput = {
  destinationLocationId?: number | null | undefined;
  driverId: string;
  estimatedDelivery: string;
  originLocationId?: number | null | undefined;
  packageIds: Array<string>;
  type?: ShipmentType | null | undefined;
  vehicleId: string;
};

export type CreateVehicleDtoInput = {
  make?: string | null | undefined;
  maxVolumeCapacity: number;
  maxWeightCapacity: number;
  model?: string | null | undefined;
  plate: string;
};

export type RegisterDriverCommandInput = {
  email: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  password: string;
  phone: string;
};

export type ShipmentStatus =
  | 'ARRIVED'
  | 'CANCELED'
  | 'DELIVERED'
  | 'DISPATCHED'
  | 'DRAFT'
  | 'LOADING';

export type ShipmentType =
  | 'LAST_MILE'
  | 'PICKUP'
  | 'TRANSFER';

export type UpdateDriverCommandInput = {
  driverId: string;
  email?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  licenseNumber?: string | null | undefined;
  phone?: string | null | undefined;
};

export type UpdateDriverStatusCommandInput = {
  driverId: string;
  isActive: boolean;
};

export type UpdateVehicleDtoInput = {
  isActive: boolean;
  make?: string | null | undefined;
  maxVolumeCapacity: number;
  maxWeightCapacity: number;
  model?: string | null | undefined;
  plate: string;
};

export type GetAddressSuggestionsQueryVariables = Exact<{
  q: string;
}>;


export type GetAddressSuggestionsQuery = { addressSuggestions: Array<string> };

export type RecordSelectedAddressMutationVariables = Exact<{
  address: string;
}>;


export type RecordSelectedAddressMutation = { recordSelectedAddress: boolean };

export type RegisterMutationVariables = Exact<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}>;


export type RegisterMutation = { register: { id: string, email: string, userName: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } };

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LoginMutation = { login: { token: string, user: { id: string, email: string, userName: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } } };

export type GetDriversQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDriversQuery = { drivers: Array<{ id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null }> };

export type GetDriverQueryVariables = Exact<{
  id: string;
}>;


export type GetDriverQuery = { driver: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } | null };

export type GetAvailableDriversQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableDriversQuery = { availableDrivers: Array<{ id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null }> };

export type GetDriverDetailsQueryVariables = Exact<{
  page: number;
  pageSize: number;
  search?: string | null | undefined;
  isActive?: boolean | null | undefined;
}>;


export type GetDriverDetailsQuery = { driverDetails: { total: number, page: number, pageSize: number, items: Array<{ id: string, userId: string, driverId: string | null, firstName: string, lastName: string, email: string, isUserActive: boolean, licenseNumber: string, licenseType: string, licenseExpiry: string, insuranceExpiry: string, assignedVehicleId: string | null, assignedVehiclePlate: string | null, assignedVehicleMake: string | null, assignedVehicleModel: string | null, createdAt: string, updatedAt: string | null }> } };

export type GetMyDriverProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyDriverProfileQuery = { myDriverProfile: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } | null };

export type RegisterDriverMutationVariables = Exact<{
  request: RegisterDriverCommandInput;
}>;


export type RegisterDriverMutation = { registerDriver: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } };

export type UpdateDriverStatusMutationVariables = Exact<{
  id: string;
  request: UpdateDriverStatusCommandInput;
}>;


export type UpdateDriverStatusMutation = { updateDriverStatus: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } };

export type AssignVehicleToDriverMutationVariables = Exact<{
  id: string;
  vehicleId?: string | null | undefined;
}>;


export type AssignVehicleToDriverMutation = { assignVehicleToDriver: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } };

export type UpdateDriverMutationVariables = Exact<{
  id: string;
  request: UpdateDriverCommandInput;
}>;


export type UpdateDriverMutation = { updateDriver: { id: string, email: string | null, phone: string | null, licenseNumber: string, isActive: boolean, applicationUserId: string | null, assignedVehicleId: string | null, assignedVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null } | null } };

export type RefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshMutation = { refresh: { token: string, user: { id: string, email: string, userName: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } } };

export type GetLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLocationsQuery = { locations: Array<{ id: string, name: string, addressLine1: string, addressLine2: string | null, city: string, state: string | null, postalCode: string, country: string, createdAt: string }> };

export type CreateLocationMutationVariables = Exact<{
  request: CreateLocationCommandInput;
}>;


export type CreateLocationMutation = { createLocation: { id: string, name: string, addressLine1: string, addressLine2: string | null, city: string, state: string | null, postalCode: string, country: string, createdAt: string } };

export type GetShipmentsQueryVariables = Exact<{
  page: number;
  pageSize: number;
  sortBy?: string | null | undefined;
  sortDir?: string | null | undefined;
  status?: string | null | undefined;
  q?: string | null | undefined;
}>;


export type GetShipmentsQuery = { shipments: { total: number, items: Array<{ id: string, routeCode: string, status: ShipmentStatus, type: ShipmentType | null, driverId: string | null, vehicleId: string, originLocationId: number | null, originLocationName: string | null, destinationLocationId: number | null, destinationLocationName: string | null, createdAt: string, estimatedDelivery: string, shippedAt: string | null, deliveredAt: string | null, arrivedAt: string | null, vehicleMaxWeightCapacity: number, vehicleMaxVolumeCapacity: number, packageIds: Array<string> }> } };

export type GetMyShipmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyShipmentsQuery = { myShipments: Array<{ id: string, routeCode: string, status: ShipmentStatus, type: ShipmentType | null, driverId: string | null, vehicleId: string, originLocationId: number | null, originLocationName: string | null, destinationLocationId: number | null, destinationLocationName: string | null, createdAt: string, estimatedDelivery: string, shippedAt: string | null, deliveredAt: string | null, arrivedAt: string | null, vehicleMaxWeightCapacity: number, vehicleMaxVolumeCapacity: number, packageIds: Array<string> }> };

export type GetShipmentQueryVariables = Exact<{
  id: string;
}>;


export type GetShipmentQuery = { shipment: { id: string, routeCode: string, status: ShipmentStatus, type: ShipmentType | null, driverId: string | null, vehicleId: string, originLocationId: number | null, originLocationName: string | null, destinationLocationId: number | null, destinationLocationName: string | null, createdAt: string, estimatedDelivery: string, shippedAt: string | null, deliveredAt: string | null, arrivedAt: string | null, vehicleMaxWeightCapacity: number, vehicleMaxVolumeCapacity: number, packageIds: Array<string> } | null };

export type CreateShipmentMutationVariables = Exact<{
  request: CreateShipmentCommandInput;
}>;


export type CreateShipmentMutation = { createShipment: { id: string, routeCode: string, status: ShipmentStatus, type: ShipmentType | null, driverId: string | null, vehicleId: string, originLocationId: number | null, originLocationName: string | null, destinationLocationId: number | null, destinationLocationName: string | null, createdAt: string, estimatedDelivery: string, shippedAt: string | null, deliveredAt: string | null, arrivedAt: string | null, vehicleMaxWeightCapacity: number, vehicleMaxVolumeCapacity: number, packageIds: Array<string> } };

export type StartShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type StartShipmentMutation = { startShipment: boolean };

export type AddPackageToShipmentMutationVariables = Exact<{
  shipmentId: string;
  packageId: string;
}>;


export type AddPackageToShipmentMutation = { addPackageToShipment: { id: string, routeCode: string, status: ShipmentStatus, type: ShipmentType | null, driverId: string | null, vehicleId: string, originLocationId: number | null, originLocationName: string | null, destinationLocationId: number | null, destinationLocationName: string | null, createdAt: string, estimatedDelivery: string, shippedAt: string | null, deliveredAt: string | null, arrivedAt: string | null, vehicleMaxWeightCapacity: number, vehicleMaxVolumeCapacity: number, packageIds: Array<string> } };

export type DispatchShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type DispatchShipmentMutation = { dispatchShipment: boolean };

export type AssignDriverToShipmentMutationVariables = Exact<{
  shipmentId: string;
  driverId: string;
}>;


export type AssignDriverToShipmentMutation = { assignDriverToShipment: boolean };

export type ArriveShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type ArriveShipmentMutation = { arriveShipment: boolean };

export type CompleteShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type CompleteShipmentMutation = { completeShipment: boolean };

export type FinalizeShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type FinalizeShipmentMutation = { finalizeShipment: boolean };

export type CancelShipmentMutationVariables = Exact<{
  shipmentId: string;
}>;


export type CancelShipmentMutation = { cancelShipment: boolean };

export type GetUsersQueryVariables = Exact<{
  page: number;
  pageSize: number;
}>;


export type GetUsersQuery = { users: { total: number, page: number, pageSize: number, items: Array<{ id: string, userName: string, email: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string }> } };

export type GetUserQueryVariables = Exact<{
  id: string;
}>;


export type GetUserQuery = { user: { id: string, userName: string, email: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } | null };

export type CreateUserMutationVariables = Exact<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}>;


export type CreateUserMutation = { createUser: { id: string, userName: string, email: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } };

export type UpdateUserMutationVariables = Exact<{
  id: string;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
  roles?: Array<string> | string | null | undefined;
}>;


export type UpdateUserMutation = { updateUser: { id: string, userName: string, email: string, firstName: string, lastName: string, emailConfirmed: boolean, isActive: boolean, roles: Array<string> | null, createdAt: string } };

export type ToggleUserStatusMutationVariables = Exact<{
  id: string;
  isActive: boolean;
}>;


export type ToggleUserStatusMutation = { toggleUserStatus: boolean };

export type GetVehiclesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVehiclesQuery = { vehicles: Array<{ id: string, licensePlate: string | null, make: string | null, model: string | null, maxWeightCapacity: number, maxVolumeCapacity: number, isActive: boolean }> };

export type GetVehicleQueryVariables = Exact<{
  id: string;
}>;


export type GetVehicleQuery = { vehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null, maxWeightCapacity: number, maxVolumeCapacity: number, isActive: boolean } | null };

export type GetAvailableVehiclesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableVehiclesQuery = { availableVehicles: Array<{ id: string, licensePlate: string | null, make: string | null, model: string | null, maxWeightCapacity: number, maxVolumeCapacity: number, isActive: boolean }> };

export type CreateVehicleMutationVariables = Exact<{
  request: CreateVehicleDtoInput;
}>;


export type CreateVehicleMutation = { createVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null, maxWeightCapacity: number, maxVolumeCapacity: number, isActive: boolean } };

export type UpdateVehicleMutationVariables = Exact<{
  id: string;
  request: UpdateVehicleDtoInput;
}>;


export type UpdateVehicleMutation = { updateVehicle: { id: string, licensePlate: string | null, make: string | null, model: string | null, maxWeightCapacity: number, maxVolumeCapacity: number, isActive: boolean } };
