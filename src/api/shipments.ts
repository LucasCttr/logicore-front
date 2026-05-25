import { gql } from 'graphql-tag';
import type {
  AddPackageToShipmentMutation,
  AddPackageToShipmentMutationVariables,
  ArriveShipmentMutation,
  ArriveShipmentMutationVariables,
  AssignDriverToShipmentMutation,
  AssignDriverToShipmentMutationVariables,
  CancelShipmentMutation,
  CancelShipmentMutationVariables,
  CompleteShipmentMutation,
  CompleteShipmentMutationVariables,
  CreateShipmentMutation,
  CreateShipmentMutationVariables,
  DispatchShipmentMutation,
  DispatchShipmentMutationVariables,
  FinalizeShipmentMutation,
  FinalizeShipmentMutationVariables,
  GetMyShipmentsQuery,
  GetShipmentQuery,
  GetShipmentQueryVariables,
  GetShipmentsQuery,
  GetShipmentsQueryVariables,
  StartShipmentMutation,
  StartShipmentMutationVariables,
} from './__generated__/graphql-types';
import Shipment, { AssignDriverDto, CreateShipmentDto, PagedResultDto } from '../types/shipments';
import { requestGraphQL, unwrapResult } from './graphqlClient';
import { normalizeShipment } from './shipmentMappers';

const GET_SHIPMENTS_QUERY = gql`
  query GetShipments($page: Int!, $pageSize: Int!, $sortBy: String, $sortDir: String, $status: String, $q: String) {
    shipments(page: $page, pageSize: $pageSize, sortBy: $sortBy, sortDir: $sortDir, status: $status, q: $q) {
      items {
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
      }
      total
    }
  }
`;

const GET_MY_SHIPMENTS_QUERY = gql`
  query GetMyShipments {
    myShipments {
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
    }
  }
`;

const GET_SHIPMENT_QUERY = gql`
  query GetShipment($id: UUID!) {
    shipment(id: $id) {
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
    }
  }
`;

const CREATE_SHIPMENT_MUTATION = gql`
  mutation CreateShipment($request: CreateShipmentCommandInput!) {
    createShipment(request: $request) {
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
    }
  }
`;

const START_MUTATION = gql`
  mutation StartShipment($shipmentId: UUID!) {
    startShipment(shipmentId: $shipmentId)
  }
`;

const ADD_PACKAGE_MUTATION = gql`
  mutation AddPackageToShipment($shipmentId: UUID!, $packageId: UUID!) {
    addPackageToShipment(shipmentId: $shipmentId, packageId: $packageId) {
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
    }
  }
`;

const DISPATCH_MUTATION = gql`
  mutation DispatchShipment($shipmentId: UUID!) {
    dispatchShipment(shipmentId: $shipmentId)
  }
`;

const ASSIGN_DRIVER_MUTATION = gql`
  mutation AssignDriverToShipment($shipmentId: UUID!, $driverId: UUID!) {
    assignDriverToShipment(shipmentId: $shipmentId, driverId: $driverId)
  }
`;

const ARRIVE_MUTATION = gql`
  mutation ArriveShipment($shipmentId: UUID!) {
    arriveShipment(shipmentId: $shipmentId)
  }
`;

const COMPLETE_MUTATION = gql`
  mutation CompleteShipment($shipmentId: UUID!) {
    completeShipment(shipmentId: $shipmentId)
  }
`;

const FINALIZE_MUTATION = gql`
  mutation FinalizeShipment($shipmentId: UUID!) {
    finalizeShipment(shipmentId: $shipmentId)
  }
`;

const CANCEL_MUTATION = gql`
  mutation CancelShipment($shipmentId: UUID!) {
    cancelShipment(shipmentId: $shipmentId)
  }
`;

export async function createShipment(payload: CreateShipmentDto): Promise<Shipment> {
  const response = await requestGraphQL<CreateShipmentMutation, CreateShipmentMutationVariables>(CREATE_SHIPMENT_MUTATION, {
    request: payload,
  });

  return normalizeShipment(unwrapResult(response.createShipment));
}

export async function startShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<StartShipmentMutation, StartShipmentMutationVariables>(START_MUTATION, { shipmentId: id });
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
  const response = await requestGraphQL<GetShipmentsQuery, GetShipmentsQueryVariables>(
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
  const response = await requestGraphQL<GetMyShipmentsQuery>(GET_MY_SHIPMENTS_QUERY);
  return unwrapResult(response.myShipments ?? []).map((item) => normalizeShipment(item));
}

export async function getShipmentById(id: string): Promise<Shipment> {
  const response = await requestGraphQL<GetShipmentQuery, GetShipmentQueryVariables>(GET_SHIPMENT_QUERY, { id });
  return normalizeShipment(unwrapResult(response.shipment));
}

export async function addPackageToShipment(id: string, payload: { packageId: string }): Promise<Shipment> {
  const response = await requestGraphQL<AddPackageToShipmentMutation, AddPackageToShipmentMutationVariables>(ADD_PACKAGE_MUTATION, {
    shipmentId: id,
    packageId: payload.packageId,
  });

  return normalizeShipment(unwrapResult(response.addPackageToShipment));
}

export async function dispatchShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<DispatchShipmentMutation, DispatchShipmentMutationVariables>(DISPATCH_MUTATION, { shipmentId: id });
  return unwrapResult(response.dispatchShipment);
}

export async function assignDriver(id: string, payload: AssignDriverDto): Promise<boolean> {
  const response = await requestGraphQL<AssignDriverToShipmentMutation, AssignDriverToShipmentMutationVariables>(ASSIGN_DRIVER_MUTATION, {
    shipmentId: id,
    driverId: payload.driverId,
  });

  return unwrapResult(response.assignDriverToShipment);
}

export async function arriveShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<ArriveShipmentMutation, ArriveShipmentMutationVariables>(ARRIVE_MUTATION, { shipmentId: id });
  return unwrapResult(response.arriveShipment);
}

export async function completeShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<CompleteShipmentMutation, CompleteShipmentMutationVariables>(COMPLETE_MUTATION, { shipmentId: id });
  return unwrapResult(response.completeShipment);
}

export async function finalizeShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<FinalizeShipmentMutation, FinalizeShipmentMutationVariables>(FINALIZE_MUTATION, { shipmentId: id });
  return unwrapResult(response.finalizeShipment);
}

export async function cancelShipment(id: string): Promise<boolean> {
  const response = await requestGraphQL<CancelShipmentMutation, CancelShipmentMutationVariables>(CANCEL_MUTATION, { shipmentId: id });
  return unwrapResult(response.cancelShipment);
}

const shipmentsApi = { createShipment, getShipments, getMyShipments, getShipmentById, addPackageToShipment, dispatchShipment, assignDriver, arriveShipment, completeShipment, finalizeShipment, cancelShipment };

export default shipmentsApi;
