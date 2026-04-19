"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { PackageForScannerDto } from '../types/scanner';
import { ShipmentType } from '../types/packages';
import axiosClient from '../api/axiosClient';
import { movePackageToDepot } from '../api/packages';
import { getShipments, addPackageToShipment } from '../api/shipments';
import type Shipment from '../types/shipments';

interface ScannerMode {
  mode: 'list' | 'detail';
  selectedPackageId?: string;
}

interface ShipmentSelection {
  isOpen: boolean;
  packageId?: string;
  shipments: Shipment[];
  isLoading: boolean;
}

export default function DepotIngressScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedPackages, setScannedPackages] = useState<Map<string, PackageForScannerDto>>(new Map());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<ScannerMode>({ mode: 'list' });
  const [duplicateScan, setDuplicateScan] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [shipmentSelection, setShipmentSelection] = useState<ShipmentSelection>({
    isOpen: false,
    shipments: [],
    isLoading: false,
  });

  // Keep input focused
  useEffect(() => {
    if (scannerMode.mode === 'list' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scannerMode.mode]);

  // Parse barcode
  const parseBarcode = (barcode: string): string | null => {
    const trimmed = barcode.trim();
    return trimmed || null;
  };

  // Get actions based on package status
  const getAvailableActions = (pkg: PackageForScannerDto) => {
    switch (pkg.status) {
      case 0: // Pending
        return [
          { label: '🚚 Collect', color: 'blue', status: 'pending' },
          { label: '⏭️ Skip', color: 'gray', status: 'skip' }
        ];
      case 1: // InTransit
        // Show action to drop off at depot
        return [{ label: '📍 Drop at Depot', color: 'orange', status: 'in-transit' }];
      case 4: // AtDepot
        // Show delivery option for Last-Mile packages (customer pickup at depot)
        // If shipment type is not returned, assume LastMile for drivers (Transfer packages handled differently)
        const isLastMile = pkg.currentShipment?.type === ShipmentType.LastMile || !pkg.currentShipment?.type;
        if (isLastMile) {
          return [{ label: '✓ Customer Pickup', color: 'green', status: 'at-depot' }];
        }
        return [];
      case 2: // Delivered
        return [];
      default:
        return [];
    }
  };

  // Validate package via API
  const validateAndAddPackage = async (trackingNumber: string) => {
    try {
      setError(null);
      setDuplicateScan(null);

      // Check for duplicate
      if (scannedPackages.has(trackingNumber)) {
        setDuplicateScan(trackingNumber);
        setInputValue('');
        return;
      }

      // Query API
      const response = await axiosClient.get(`/api/packages/scanner/tracking/${trackingNumber}`);

      if (!response.data.isSuccess) {
        setError(response.data.error || 'Package not found');
        setInputValue('');
        return;
      }

      const packageData: PackageForScannerDto = response.data.value;
      const newScanned = new Map(scannedPackages);
      newScanned.set(trackingNumber, packageData);
      setScannedPackages(newScanned);
      
      // Auto-select the newly scanned package to show details
      setScannerMode({ mode: 'detail', selectedPackageId: packageData.id });
      
      setSuccess(`✓ Package ${packageData.trackingNumber} scanned`);
      setInputValue('');

      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error scanning package');
      setInputValue('');
    }
  };

  // Handle input submit
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const scannedId = parseBarcode(inputValue);
    if (!scannedId) {
      setError('Invalid barcode');
      return;
    }

    validateAndAddPackage(scannedId);
  };

  // Remove package
  const removePackage = (trackingNumber: string) => {
    const newScanned = new Map(scannedPackages);
    newScanned.delete(trackingNumber);
    setScannedPackages(newScanned);
    setError(null);
    setSuccess(null);
  };

  // Show package detail
  const showDetail = (pkg: PackageForScannerDto) => {
    setScannerMode({ mode: 'detail', selectedPackageId: pkg.id });
  };

  // Hide detail
  const hideDetail = () => {
    setScannerMode({ mode: 'list' });
    if (inputRef.current) inputRef.current.focus();
  };

  // Open shipment selection modal
  const openShipmentSelection = async (pkg: PackageForScannerDto) => {
    setShipmentSelection({ isOpen: true, packageId: pkg.id, shipments: [], isLoading: true });
    try {
      const result = await getShipments(1, 100, undefined, undefined, 'NotShipped');
      setShipmentSelection(prev => ({ ...prev, shipments: result.items, isLoading: false }));
    } catch (err) {
      setError('Failed to load shipments');
      setShipmentSelection(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Assign package to shipment
  const assignPackageToShipment = async (shipmentId: string) => {
    if (!shipmentSelection.packageId) return;
    setIsActionLoading(true);
    try {
      await addPackageToShipment(shipmentId, { packageId: shipmentSelection.packageId });
      
      const updatedPackages = new Map(scannedPackages);
      const pkgToUpdate = Array.from(scannedPackages.values()).find(p => p.id === shipmentSelection.packageId);
      if (pkgToUpdate) {
        const updatedPkg = { ...pkgToUpdate, status: 4, statusLabel: 'At Depot' }; // Move to AtDepot
        updatedPackages.set(pkgToUpdate.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
      }
      
      setSuccess(`✓ Package assigned to shipment!`);
      setShipmentSelection({ isOpen: false, shipments: [], isLoading: false });
      hideDetail();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to assign package');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle action
  const handleAction = async (pkg: PackageForScannerDto, action: string) => {
    try {
      setError(null);
      setIsActionLoading(true);
      
      // Handle "Collect" action (Pending → InTransit)
      if (action.includes('Collect')) {
        await axiosClient.post(`/api/packages/${pkg.id}/collect`, {});
        
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 1, statusLabel: 'In Transit' }; // 1 = InTransit
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package collected and loaded in vehicle!`);
        hideDetail();
      }
      // Handle "Skip" action (Pending stays Pending - couldn't collect)
      else if (action.includes('Skip')) {
        setSuccess(`⏭️ Package skipped - remains pending for next attempt`);
        hideDetail();
      }
      // Handle "Drop at Depot" action (InTransit → AtDepot)
      else if (action.includes('Drop at Depot')) {
        await movePackageToDepot(pkg.id);
        
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 4, statusLabel: 'At Depot' }; // 4 = AtDepot
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package dropped at depot!`);
        hideDetail();
      }
      // Handle "Move to Depot" action (legacy)
      else if (action.includes('Move to Depot')) {
        await movePackageToDepot(pkg.id);
        
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 4, statusLabel: 'At Depot' };
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package moved to depot successfully`);
        hideDetail();
      } 
      // Handle "Deliver to Customer" (for LastMile shipments in transit)
      else if (action.includes('Deliver to Customer')) {
        await axiosClient.post(`/api/packages/${pkg.id}/deliver`, {});
        
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 2, statusLabel: 'Delivered' }; // 2 = Delivered
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package delivered to customer!`);
        hideDetail();
      }
      // Handle "Customer Pickup" (from AtDepot for LastMile)
      else if (action.includes('Customer Pickup')) {
        await axiosClient.post(`/api/packages/${pkg.id}/mark-delivered`, { 
          packageId: pkg.id,
          deliveryNotes: 'Picked up at depot' 
        });
        
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 2, statusLabel: 'Delivered' }; // 2 = Delivered
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package picked up by customer at depot!`);
        hideDetail();
      }
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to perform action');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Get selected package
  const selectedPackage = scannerMode.selectedPackageId
    ? Array.from(scannedPackages.values()).find(p => p.id === scannerMode.selectedPackageId)
    : null;

  const totalWeight = Array.from(scannedPackages.values()).reduce((sum, pkg) => sum + pkg.weight, 0);

  // Status color map
  const statusColors: Record<number, string> = {
    0: 'yellow', // Pending
    1: 'blue',   // InTransit
    2: 'green',  // Delivered
    3: 'red',    // Canceled
    4: 'orange', // AtDepot
    5: 'purple', // DeliveredToCenter
    6: 'gray',   // Returned
  };

  return (
    <div className="w-full to-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Scanner Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
          <form onSubmit={handleInputSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Scan tracking number
              </label>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Scan here or paste tracking number..."
                autoFocus
                disabled={scannerMode.mode === 'detail'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-mono text-gray-900 disabled:bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={scannerMode.mode === 'detail' || !inputValue.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Scan Package
            </button>
          </form>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <strong>❌ Error:</strong> {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}
          {duplicateScan && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
              ⚠️ Package already scanned in this session
            </div>
          )}
        </div>

        {/* Detail View */}
        {scannerMode.mode === 'detail' && selectedPackage && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{selectedPackage.trackingNumber}</h2>
                <p className="text-gray-600 text-sm mt-1">ID: {selectedPackage.id}</p>
              </div>
              <button
                onClick={hideDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 font-semibold">Status</div>
                <div className={`text-xl font-bold mt-1 ${
                  selectedPackage.status === 0 ? 'text-yellow-600' :
                  selectedPackage.status === 4 ? 'text-orange-600' :
                  selectedPackage.status === 1 ? 'text-blue-600' :
                  selectedPackage.status === 2 ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {selectedPackage.statusLabel}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 font-semibold">Weight</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{selectedPackage.weight.toFixed(2)} kg</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 font-semibold">Origin</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">{selectedPackage.originAddress || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-600 font-semibold">Destination</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">{selectedPackage.destinationAddress || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <div className="text-xs text-gray-600 font-semibold mb-2">Recipient</div>
              <div className="text-lg font-semibold text-slate-900">{selectedPackage.recipientName || 'Unknown'}</div>
            </div>

            {/* Available Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                {getAvailableActions(selectedPackage).length > 0 ? (
                  getAvailableActions(selectedPackage).map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(selectedPackage, action.label)}
                      disabled={isActionLoading}
                      className={`py-3 px-4 rounded-lg font-semibold text-white transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        action.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                        action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        action.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                        action.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {isActionLoading ? '⏳ Processing...' : action.label}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 p-4 bg-gray-100 rounded-lg text-gray-600 text-center">
                    No actions available for this package status
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={hideDetail}
              className="mt-6 w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        )}

        {/* Shipment Selection Modal */}
        {shipmentSelection.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Select Shipment</h2>
              
              {shipmentSelection.isLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading shipments...</div>
                </div>
              ) : shipmentSelection.shipments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">No available shipments</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {shipmentSelection.shipments.map((shipment) => (
                    <button
                      key={shipment.id}
                      onClick={() => assignPackageToShipment(shipment.id)}
                      disabled={isActionLoading}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-semibold text-slate-900">{shipment.routeCode}</div>
                      <div className="text-sm text-gray-600">
                        Vehicle: {shipment.vehicleId} • Packages: {shipment.packageIds?.length || 0}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShipmentSelection({ isOpen: false, shipments: [], isLoading: false })}
                className="mt-4 w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Packages List */}
        {scannerMode.mode === 'list' && scannedPackages.size > 0 && (
          <>
            {/* Packages Table */}
          </>
        )}

        {/* Empty State */}
        {scannedPackages.size === 0 && !error && scannerMode.mode === 'list' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to scan</h3>
            <p className="text-gray-600">Scan packages to view available actions based on their status</p>
          </div>
        )}
      </div>
    </div>
  );
}
