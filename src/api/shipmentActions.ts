import api from './axiosClient';

/**
 * Driver starts a shipment (marks as active/Dispatched)
 * Only Draft shipments can be started
 * Driver can have only one active shipment at a time
 */
export async function startShipment(shipmentId: string): Promise<any> {
  try {
    const res = await api.post(`/api/shipments/${shipmentId}/start`, {});
    if (res.data?.isSuccess === false) {
      return { isSuccess: false, error: res.data?.error || 'Failed to start shipment' };
    }
    return res.data || { isSuccess: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.error 
      ? error.response.data.error
      : error.message || 'Failed to start shipment';
    
    return { isSuccess: false, error: errorMessage };
  }
}

/**
 * Driver marks shipment as arrived at destination
 * All InTransit packages transition to AtDepot
 * Pending packages remain Pending (not collected)
 */
export async function arriveShipment(shipmentId: string): Promise<any> {
  try {
    const res = await api.post(`/api/shipments/${shipmentId}/arrive`, {});
    if (res.data?.isSuccess === false) {
      return { isSuccess: false, error: res.data?.error || 'Failed to mark shipment as arrived' };
    }
    return res.data || { isSuccess: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.error 
      ? error.response.data.error
      : error.message || 'Failed to mark shipment as arrived';
    
    return { isSuccess: false, error: errorMessage };
  }
}

/**
 * Driver completes shipment delivery
 * Marks shipment as Delivered
 */
export async function completeShipment(shipmentId: string): Promise<any> {
  try {
    const res = await api.post(`/api/shipments/${shipmentId}/complete`, {});
    if (res.data?.isSuccess === false) {
      return { isSuccess: false, error: res.data?.error || 'Failed to complete shipment' };
    }
    return res.data || { isSuccess: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.error 
      ? error.response.data.error
      : error.message || 'Failed to complete shipment';
    
    return { isSuccess: false, error: errorMessage };
  }
}

/**
 * Admin dispatches shipment (Draft → Dispatched)
 * All assigned packages transition to InTransit
 */
export async function dispatchShipment(shipmentId: string): Promise<any> {
  try {
    const res = await api.post(`/api/shipments/${shipmentId}/dispatch`, {});
    if (res.data?.isSuccess === false) {
      return { isSuccess: false, error: res.data?.error || 'Failed to dispatch shipment' };
    }
    return res.data || { isSuccess: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.error 
      ? error.response.data.error
      : error.message || 'Failed to dispatch shipment';
    
    return { isSuccess: false, error: errorMessage };
  }
}
