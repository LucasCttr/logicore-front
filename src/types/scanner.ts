import { ShipmentType, CurrentShipment } from './packages';

export interface PackageForScannerDto {
  id: string;
  trackingNumber: string;
  status: number;
  statusLabel: string;
  weight: number;
  originAddress?: string;
  destinationAddress?: string;
  recipientName?: string;
  currentShipment?: CurrentShipment | null;
}
