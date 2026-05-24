import Shipment, { AssignDriverDto, CreateShipmentDto, PagedResultDto } from '../types/shipments';
import { requestGraphQL, unwrapResult } from './graphqlClient';
import { normalizeShipment } from './shipmentMappers';

type ShipmentQueryResponse = {
  shipments?: {
    items: Shipment[];
    total: number;
  };
  myShipments?: Shipment[];
  shipment?: Shipment | null;
  createShipment?: Shipment;
  startShipment?: boolean;
  addPackageToShipment?: Shipment;
  dispatchShipment?: boolean;
  assignDriverToShipment?: boolean;
  arriveShipment?: boolean;
  completeShipment?: boolean;
  finalizeShipment?: boolean;
  cancelShipment?: boolean;
};

const SHIPMENT_FIELDS = `
  id
  routeCode
  status
  type
  driverId
  vehicleId
  originLocationId
  originLocationName
  destinationLocationId
  destinationLocationName
  createdAt
  estimatedDelivery
  shippedAt
  deliveredAt
  arrivedAt
  vehicleMaxWeightCapacity
  vehicleMaxVolumeCapacity
  packageIds
`;

const GET_SHIPMENTS_QUERY = `
  query GetShipments($page: Int!, $pageSize: Int!, $sortBy: String, $sortDir: String, $status: String, $q: String) {
    shipments(page: $page, pageSize: $pageSize, sortBy: $sortBy, sortDir: $sortDir, status: $status, q: $q) {
      items {
        ${SHIPMENT_FIELDS}
      }
      total
    }
  }
`;

const GET_MY_SHIPMENTS_QUERY = `
  query GetMyShipments {
    myShipments {
      ${SHIPMENT_FIELDS}
    }
  }
`;

const GET_SHIPMENT_QUERY = `
  query GetShipment($id: ID!) {
    shipment(id: $id) {
      ${SHIPMENT_FIELDS}
    }
  }
`;

const CREATE_SHIPMENT_MUTATION = `
  mutation CreateShipment($request: CreateShipmentCommandInput!) {
    createShipment(request: $request) {
      ${SHIPMENT_FIELDS}
    }
  }
`;

const START_MUTATION = `
  mutation StartShipment($shipmentId: ID!) {
    startShipment(shipmentId: $shipmentId)
  }
`;

const ADD_PACKAGE_MUTATION = `
  mutation AddPackageToShipment($shipmentId: ID!, $packageId: ID!) {
    addPackageToShipment(shipmentId: $shipmentId, packageId: $packageId) {
      ${SHIPMENT_FIELDS}
    }
  }
`;

const DISPATCH_MUTATION = `
  mutation DispatchShipment($shipmentId: ID!) {
    dispatchShipment(shipmentId: $shipmentId)
  }
`;

const ASSIGN_DRIVER_MUTATION = `
  mutation AssignDriverToShipment($shipmentId: ID!, $driverId: ID!) {
    assignDriverToShipment(shipmentId: $shipmentId, driverId: $driverId)
  }
`;

const ARRIVE_MUTATION = `
  mutation ArriveShipment($shipmentId: ID!) {
    arriveShipment(shipmentId: $shipmentId)
  }
`;

const COMPLETE_MUTATION = `
  mutation CompleteShipment($shipmentId: ID!) {
    completeShipment(shipmentId: $shipmentId)
  }
`;

const FINALIZE_MUTATION = `
  mutation FinalizeShipment($shipmentId: ID!) {
    finalizeShipment(shipmentId: $shipmentId)
  }
`;

const CANCEL_MUTATION = `
  mutation CancelShipment($shipmentId: ID!) {
    cancelShipment(shipmentId: $shipmentId)
  }
`;

export async function createShipment(payload: CreateShipmentDto): Promise<Shipment> {
  const response = await requestGraphQL<ShipmentQueryResponse, { request: CreateShipmentDto }>(CREATE_SHIPMENT_MUTATION, {
    request: payload,
  });

  return normalizeShipment(unwrapResult(response.createShipment));
}

export async function startShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(START_MUTATION, { shipmentId: id });
  return unwrapResult(response.startShipment);
}

export async function getShipments(
  page = 1,
  pageSize = 10,
  sortBy?: string,
  sortDir?: string,
  status?: string,
  q?: string,
): Promise<PagedResultDto<Shipment>> {
  const response = await requestGraphQL<ShipmentQueryResponse, { page: number; pageSize: number; sortBy?: string; sortDir?: string; status?: string; q?: string }>(
    GET_SHIPMENTS_QUERY,
    { page, pageSize, sortBy, sortDir, status, q },
  );

  const result = unwrapResult(response.shipments ?? { items: [], total: 0, page, pageSize });
  return {
    ...result,
    items: result.items.map((item) => normalizeShipment(item)),
    page,
    pageSize,
  };
}

export async function getMyShipments(): Promise<Shipment[]> {
  const response = await requestGraphQL<ShipmentQueryResponse>(GET_MY_SHIPMENTS_QUERY);
  return unwrapResult(response.myShipments ?? []).map((item) => normalizeShipment(item));
}

export async function getShipmentById(id: string): Promise<Shipment> {
  const response = await requestGraphQL<ShipmentQueryResponse, { id: string }>(GET_SHIPMENT_QUERY, { id });
  return normalizeShipment(unwrapResult(response.shipment));
}

export async function addPackageToShipment(id: string, payload: { packageId: string }): Promise<Shipment> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string; packageId: string }>(ADD_PACKAGE_MUTATION, {
    shipmentId: id,
    packageId: payload.packageId,
  });

  return normalizeShipment(unwrapResult(response.addPackageToShipment));
}

export async function dispatchShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(DISPATCH_MUTATION, { shipmentId: id });
  return unwrapResult(response.dispatchShipment);
}

export async function assignDriver(id: string, payload: AssignDriverDto): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string; driverId: string }>(ASSIGN_DRIVER_MUTATION, {
    shipmentId: id,
    driverId: payload.driverId,
  });

  return unwrapResult(response.assignDriverToShipment);
}

export async function arriveShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(ARRIVE_MUTATION, { shipmentId: id });
  return unwrapResult(response.arriveShipment);
}

export async function completeShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(COMPLETE_MUTATION, { shipmentId: id });
  return unwrapResult(response.completeShipment);
}

export async function finalizeShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(FINALIZE_MUTATION, { shipmentId: id });
  return unwrapResult(response.finalizeShipment);
}

export async function cancelShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ShipmentQueryResponse, { shipmentId: string }>(CANCEL_MUTATION, { shipmentId: id });
  return unwrapResult(response.cancelShipment);
}

const shipmentsApi = { createShipment, getShipments, getMyShipments, getShipmentById, addPackageToShipment, dispatchShipment, assignDriver, arriveShipment, completeShipment, finalizeShipment, cancelShipment };

export default shipmentsApi;
