import type {
  Package,
  CreatePackageDto,
  UpdatePackageDto,
  PackagePublicHistoryDto,
  PackageInternalHistoryDto,
  PagedResponse,
} from '../types/packages';
import { requestGraphQL, unwrapResult } from './graphqlClient';

type PackageCurrentShipment = {
  id: string;
  type: number;
  destinationName?: string | null;
  destinationLocationId?: number | null;
};

type PackageRecipientGraphQL = {
  name?: string | null;
  address?: string | null;
};

type PackageDimensionsGraphQL = {
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
};

type PackageListItemGraphQL = {
  id: string;
  trackingNumber?: string | null;
  status?: number | string | null;
  priority?: number | string | null;
  createdAt?: string | null;
  lastUpdatedAt?: string | null;
  destinationAddress?: string | null;
  currentLocationId?: number | null;
  recipient?: PackageRecipientGraphQL | null;
};

type PackageDetailGraphQL = PackageListItemGraphQL & {
  description?: string | null;
  weight?: number | null;
  shipmentId?: string | null;
  originAddress?: string | null;
  recipient?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    floorApartment?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    dni?: string | null;
  } | null;
  currentShipment?: PackageCurrentShipment | null;
  dimensions?: PackageDimensionsGraphQL | null;
  internalCode?: string | null;
};

type ScannerPackage = {
  id: string;
  trackingNumber: string;
  status: number;
  statusLabel: string;
  weight: number;
  originAddress?: string | null;
  destinationAddress?: string | null;
  recipientName?: string | null;
  currentShipment?: PackageCurrentShipment | null;
  currentLocationId?: number | null;
};

type PackagePublicHistoryGraphQL = {
  trackingNumber: string;
  history?: Array<{
    status: string;
    occurredAt: string;
  }>;
};

type PackageInternalHistoryGraphQL = {
  fromStatus: string;
  toStatus: string;
  occurredAt: string;
  notes?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  userRoles?: string | null;
  locationId?: number | null;
  shipmentId?: string | null;
};

type PackageQueryResponse = {
  getPackages?: PagedResponse<PackageListItemGraphQL>;
  getPackage?: PackageDetailGraphQL | null;
  createPackage?: PackageDetailGraphQL;
  updatePackage?: PackageDetailGraphQL;
  deliverPackage?: PackageDetailGraphQL;
  cancelPackage?: PackageDetailGraphQL;
  movePackageToDepot?: boolean;
  getPackageByTracking?: PackagePublicHistoryGraphQL | null;
  getPackageHistory?: PackageInternalHistoryGraphQL[];
  markPackageAsDelivered?: boolean;
  markPackageAsCollected?: boolean;
  markPackageAttemptFailed?: boolean;
  collectPackage?: boolean;
  getPackageForScannerByTracking?: ScannerPackage | null;
  getPackageForScanner?: ScannerPackage | null;
};

function mapPackage(packageDto: PackageListItemGraphQL | PackageDetailGraphQL): Package {
  return {
    ...packageDto,
    destination: packageDto.destinationAddress ?? null,
    destinationAddress: packageDto.destinationAddress ?? null,
  };
}

const PACKAGE_LIST_FIELDS = `
  id
  trackingNumber
  status
  createdAt
  lastUpdatedAt
  priority
  destinationAddress
  currentLocationId
  recipient {
    name
    address
  }
`;

const PACKAGE_DETAIL_FIELDS = `
  ${PACKAGE_LIST_FIELDS}
  description
  weight
  shipmentId
  originAddress
  recipient {
    name
    address
    phone
    floorApartment
    city
    province
    postalCode
    dni
  }
  currentShipment {
    id
    type
    destinationName
    destinationLocationId
  }
  dimensions {
    lengthCm
    widthCm
    heightCm
  }
  internalCode
`;

const PACKAGE_SCANNER_FIELDS = `
  id
  trackingNumber
  status
  statusLabel
  weight
  originAddress
  destinationAddress
  recipientName
  currentLocationId
  currentShipment {
    id
    type
    destinationName
    destinationLocationId
  }
`;

const PACKAGE_PUBLIC_HISTORY_FIELDS = `
  trackingNumber
  history {
    status
    occurredAt
  }
`;

const PACKAGE_INTERNAL_HISTORY_FIELDS = `
  fromStatus
  toStatus
  occurredAt
  notes
  firstName
  lastName
  userName
  userRoles
  locationId
  shipmentId
`;

const GET_PACKAGES_QUERY = `
  query GetPackages($page: Int!, $pageSize: Int!) {
    getPackages(page: $page, pageSize: $pageSize) {
      items {
        ${PACKAGE_LIST_FIELDS}
      }
      total
      page
      pageSize
    }
  }
`;

const GET_PACKAGE_QUERY = `
  query GetPackage($id: ID!) {
    getPackage(id: $id) {
      ${PACKAGE_DETAIL_FIELDS}
    }
  }
`;

const CREATE_PACKAGE_MUTATION = `
  mutation CreatePackage($request: CreatePackageCommandInput!) {
    createPackage(request: $request) {
      ${PACKAGE_DETAIL_FIELDS}
    }
  }
`;

const UPDATE_PACKAGE_MUTATION = `
  mutation UpdatePackage($id: ID!, $request: UpdatePackageCommandInput!) {
    updatePackage(id: $id, request: $request) {
      ${PACKAGE_DETAIL_FIELDS}
    }
  }
`;

const DELIVER_PACKAGE_MUTATION = `
  mutation DeliverPackage($id: ID!) {
    deliverPackage(id: $id) {
      ${PACKAGE_DETAIL_FIELDS}
    }
  }
`;

const CANCEL_PACKAGE_MUTATION = `
  mutation CancelPackage($id: ID!) {
    cancelPackage(id: $id) {
      ${PACKAGE_DETAIL_FIELDS}
    }
  }
`;

const MOVE_PACKAGE_TO_DEPOT_MUTATION = `
  mutation MovePackageToDepot($id: ID!) {
    movePackageToDepot(id: $id)
  }
`;

const PACKAGE_BY_TRACKING_QUERY = `
  query GetPackageByTracking($trackingNumber: String!) {
    getPackageByTracking(trackingNumber: $trackingNumber) {
      ${PACKAGE_PUBLIC_HISTORY_FIELDS}
    }
  }
`;

const PACKAGE_HISTORY_QUERY = `
  query GetPackageHistory($id: ID!) {
    getPackageHistory(id: $id) {
      ${PACKAGE_INTERNAL_HISTORY_FIELDS}
    }
  }
`;

const PACKAGE_FOR_SCANNER_BY_TRACKING_QUERY = `
  query GetPackageForScannerByTracking($trackingNumber: String!) {
    getPackageForScannerByTracking(trackingNumber: $trackingNumber) {
      ${PACKAGE_SCANNER_FIELDS}
    }
  }
`;

const PACKAGE_FOR_SCANNER_QUERY = `
  query GetPackageForScanner($id: ID!) {
    getPackageForScanner(id: $id) {
      ${PACKAGE_SCANNER_FIELDS}
    }
  }
`;

const MARK_DELIVERED_MUTATION = `
  mutation MarkPackageAsDelivered($id: ID!, $latitude: Decimal, $longitude: Decimal, $deliveryNotes: String) {
    markPackageAsDelivered(id: $id, latitude: $latitude, longitude: $longitude, deliveryNotes: $deliveryNotes)
  }
`;

const MARK_COLLECTED_MUTATION = `
  mutation MarkPackageAsCollected($id: ID!, $collectionNotes: String) {
    markPackageAsCollected(id: $id, collectionNotes: $collectionNotes)
  }
`;

const COLLECT_PACKAGE_MUTATION = `
  mutation CollectPackage($id: ID!) {
    collectPackage(id: $id)
  }
`;

const MARK_ATTEMPT_FAILED_MUTATION = `
  mutation MarkPackageAttemptFailed($id: ID!, $reason: String) {
    markPackageAttemptFailed(id: $id, reason: $reason)
  }
`;

export async function getPackages(page = 1, pageSize = 20): Promise<PagedResponse<Package>> {
  const response = await requestGraphQL<PackageQueryResponse, { page: number; pageSize: number }>(GET_PACKAGES_QUERY, { page, pageSize });
  const result = unwrapResult(response.getPackages ?? { items: [], total: 0, page, pageSize });
  return {
    ...result,
    items: result.items.map((item) => mapPackage(item)),
  };
}

export async function getPackageById(id: string): Promise<Package> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(GET_PACKAGE_QUERY, { id });
  return mapPackage(unwrapResult(response.getPackage));
}

export async function createPackage(payload: CreatePackageDto): Promise<Package> {
  const response = await requestGraphQL<PackageQueryResponse, { request: CreatePackageDto }>(CREATE_PACKAGE_MUTATION, { request: payload });
  return mapPackage(unwrapResult(response.createPackage));
}

export async function updatePackage(id: string, payload: UpdatePackageDto): Promise<Package> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string; request: UpdatePackageDto }>(UPDATE_PACKAGE_MUTATION, { id, request: payload });
  return mapPackage(unwrapResult(response.updatePackage));
}

export async function deliverPackage(id: string): Promise<Package> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(DELIVER_PACKAGE_MUTATION, { id });
  return mapPackage(unwrapResult(response.deliverPackage));
}

export async function cancelPackage(id: string): Promise<Package> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(CANCEL_PACKAGE_MUTATION, { id });
  return mapPackage(unwrapResult(response.cancelPackage));
}

export async function movePackageToDepot(id: string): Promise<boolean> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(MOVE_PACKAGE_TO_DEPOT_MUTATION, { id });
  return unwrapResult(response.movePackageToDepot);
}

export async function getPackageByTracking(trackingNumber: string): Promise<PackagePublicHistoryDto | null> {
  const response = await requestGraphQL<PackageQueryResponse, { trackingNumber: string }>(PACKAGE_BY_TRACKING_QUERY, { trackingNumber }, { authenticated: false });
  const result = unwrapResult(response.getPackageByTracking);
  return {
    trackingNumber: result.trackingNumber,
    events: (result.history ?? []).map((entry) => ({
      at: entry.occurredAt,
      message: entry.status,
    })),
  };
}

export async function getPackageHistory(id: string): Promise<PackageInternalHistoryDto[]> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(PACKAGE_HISTORY_QUERY, { id });
  return unwrapResult(response.getPackageHistory ?? []);
}

export async function markPackageAsDelivered(
  id: string,
  data: { deliveryLatitude?: number; deliveryLongitude?: number; deliveryNotes?: string },
): Promise<boolean> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string; latitude?: number; longitude?: number; deliveryNotes?: string }>(
    MARK_DELIVERED_MUTATION,
    {
      id,
      latitude: data.deliveryLatitude,
      longitude: data.deliveryLongitude,
      deliveryNotes: data.deliveryNotes,
    },
  );
  return unwrapResult(response.markPackageAsDelivered);
}

export async function markPackageAsCollected(
  id: string,
  data: { collectionNotes?: string } = {},
): Promise<boolean> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string; collectionNotes?: string }>(MARK_COLLECTED_MUTATION, {
    id,
    collectionNotes: data.collectionNotes,
  });
  return unwrapResult(response.markPackageAsCollected);
}

export async function collectPackage(id: string): Promise<boolean> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(COLLECT_PACKAGE_MUTATION, { id });
  return unwrapResult(response.collectPackage);
}

export async function markPackageAsAttemptFailed(
  id: string,
  data: { reason?: string } = {},
): Promise<boolean> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string; reason?: string }>(MARK_ATTEMPT_FAILED_MUTATION, {
    id,
    reason: data.reason,
  });
  return unwrapResult(response.markPackageAttemptFailed);
}

export async function getPackageForScannerByTracking(trackingNumber: string): Promise<ScannerPackage | null> {
  const response = await requestGraphQL<PackageQueryResponse, { trackingNumber: string }>(
    PACKAGE_FOR_SCANNER_BY_TRACKING_QUERY,
    { trackingNumber },
  );

  return unwrapResult(response.getPackageForScannerByTracking);
}

export async function getPackageForScanner(id: string): Promise<ScannerPackage | null> {
  const response = await requestGraphQL<PackageQueryResponse, { id: string }>(PACKAGE_FOR_SCANNER_QUERY, { id });
  return unwrapResult(response.getPackageForScanner);
}
