"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { PackageForScannerDto } from '../types/scanner';
import axiosClient from '../api/axiosClient';
import { movePackageToDepot } from '../api/packages';

interface ScannerMode {
  mode: 'list' | 'detail';
  selectedPackageId?: string;
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
          { label: '📦 Move to Depot', color: 'green', status: 'pending' }
        ];
      case 4: // AtDepot
        return [
          { label: '🚚 Assign to Shipment', color: 'blue', status: 'at-depot' },
          { label: '📍 Move Shelf', color: 'purple', status: 'at-depot' }
        ];
      case 1: // InTransit
        return [
          { label: '✓ Deliver to Customer', color: 'green', status: 'in-transit' },
          { label: '⚠️ Register Issue', color: 'red', status: 'in-transit' }
        ];
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

  // Handle action
  const handleAction = async (pkg: PackageForScannerDto, action: string) => {
    setIsActionLoading(true);
    try {
      setError(null);
      
      // Handle "Move to Depot" action
      if (action.includes('Move to Depot')) {
        await movePackageToDepot(pkg.id);
        
        // Update the scanned packages list with new status
        const updatedPackages = new Map(scannedPackages);
        const updatedPkg = { ...pkg, status: 4, statusLabel: 'At Depot' }; // 4 = AtDepot
        updatedPackages.set(pkg.trackingNumber, updatedPkg);
        setScannedPackages(updatedPackages);
        
        setSuccess(`✓ Package moved to depot successfully`);
        hideDetail();
      } else if (action.includes('Assign to Shipment')) {
        setSuccess(`✓ Action "${action}" ready (feature coming soon)`);
      } else if (action.includes('Move Shelf')) {
        setSuccess(`✓ Action "${action}" ready (feature coming soon)`);
      } else if (action.includes('Deliver to Customer')) {
        setSuccess(`✓ Action "${action}" ready (feature coming soon)`);
      } else if (action.includes('Register Issue')) {
        setSuccess(`✓ Action "${action}" ready (feature coming soon)`);
      } else {
        setSuccess(`✓ Action "${action}" ready (feature coming soon)`);
      }
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to perform action');
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Scanner</h1>
          <p className="text-gray-600">Scan packages and manage actions based on status</p>
        </div>

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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-mono disabled:bg-gray-100"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        {/* Packages List */}
        {scannerMode.mode === 'list' && scannedPackages.size > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{scannedPackages.size}</div>
                <div className="text-sm text-gray-600">Scanned</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{totalWeight.toFixed(2)}</div>
                <div className="text-sm text-gray-600">kg Total</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Array.from(scannedPackages.values()).filter(p => p.status === 0).length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(scannedPackages.values()).map((pkg) => {
                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer border-l-4"
                    style={{
                      borderLeftColor: pkg.status === 0 ? '#fbbf24' : pkg.status === 4 ? '#f97316' : pkg.status === 1 ? '#3b82f6' : '#10b981'
                    }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-mono font-bold text-sm text-slate-900">{pkg.trackingNumber}</h3>
                          <p className="text-xs text-gray-500 mt-1">{pkg.recipientName || 'Unknown'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                          pkg.status === 0 ? 'bg-yellow-500' :
                          pkg.status === 4 ? 'bg-orange-500' :
                          pkg.status === 1 ? 'bg-blue-500' :
                          pkg.status === 2 ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}>
                          {pkg.statusLabel}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3 space-y-1">
                        <div>📍 {pkg.destinationAddress || 'N/A'}</div>
                        <div>⚖️ {pkg.weight.toFixed(2)} kg</div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() => showDetail(pkg)}
                          className="flex-1 py-1 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => removePackage(pkg.trackingNumber)}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold rounded transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
