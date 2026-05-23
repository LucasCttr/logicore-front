import {
  startShipment as startShipmentMutation,
  arriveShipment as arriveShipmentMutation,
  completeShipment as completeShipmentMutation,
  dispatchShipment as dispatchShipmentMutation,
} from './shipments';

/**
 * Driver starts a shipment (marks as active/Dispatched)
 * Only Draft shipments can be started
 * Driver can have only one active shipment at a time
 */
export async function startShipment(shipmentId: string): Promise<{ isSuccess: boolean; error?: string }> {
  try {
    return { isSuccess: await startShipmentMutation(shipmentId) };
  } catch (error) {
    return { isSuccess: false, error: error instanceof Error ? error.message : 'Failed to start shipment' };
  }
}

/**
 * Driver marks shipment as arrived at destination
 * All InTransit packages transition to AtDepot
 * Pending packages remain Pending (not collected)
 */
export async function arriveShipment(shipmentId: string): Promise<{ isSuccess: boolean; error?: string }> {
  try {
    return { isSuccess: await arriveShipmentMutation(shipmentId) };
  } catch (error) {
    return { isSuccess: false, error: error instanceof Error ? error.message : 'Failed to mark shipment as arrived' };
  }
}

/**
 * Driver completes shipment delivery
 * Marks shipment as Delivered
 */
export async function completeShipment(shipmentId: string): Promise<{ isSuccess: boolean; error?: string }> {
  try {
    return { isSuccess: await completeShipmentMutation(shipmentId) };
  } catch (error) {
    return { isSuccess: false, error: error instanceof Error ? error.message : 'Failed to complete shipment' };
  }
}

/**
 * Admin dispatches shipment (Draft → Dispatched)
 * All assigned packages transition to InTransit
 */
export async function dispatchShipment(shipmentId: string): Promise<{ isSuccess: boolean; error?: string }> {
  try {
    return { isSuccess: await dispatchShipmentMutation(shipmentId) };
  } catch (error) {
    return { isSuccess: false, error: error instanceof Error ? error.message : 'Failed to dispatch shipment' };
  }
}
