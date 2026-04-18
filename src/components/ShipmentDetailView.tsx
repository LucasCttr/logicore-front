"use client";

import React, { useEffect, useState } from 'react';
import { getPackageById, markPackageAsDelivered, markPackageAsCollected } from '../api/packages';
import { ChevronLeft, Package, Truck, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ShipmentDetailViewProps {
  shipment: any;
  driver: any | null;
  isDriver: boolean;
}

export default function ShipmentDetailView({ shipment, driver, isDriver }: ShipmentDetailViewProps) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [markingDelivery, setMarkingDelivery] = useState<Set<string>>(new Set());
  const [markingCollection, setMarkingCollection] = useState<Set<string>>(new Set());
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Get shipment type from the shipment object
  const getShipmentTypeLabel = (): string => {
    const type = shipment?.type;
    switch (type) {
      case 0:
        return 'Pickup';
      case 1:
        return 'Depot-to-Depot Transfer';
      case 2:
        return 'Last-Mile Delivery';
      default:
        // Fallback: infer from destinationLocationId if type not available
        return shipment?.destinationLocationId ? 'Depot-to-Depot Transfer' : 'Last-Mile Delivery';
    }
  };

  const shipmentType = getShipmentTypeLabel();

  // Load package details when shipment changes
  useEffect(() => {
    if (!shipment?.packageIds || shipment.packageIds.length === 0) return;

    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        const packagesData = await Promise.all(
          shipment.packageIds.map((pid: string) => 
            getPackageById(pid).catch(err => {
              console.error(`Failed to load package ${pid}:`, err);
              return { id: pid, trackingNumber: 'N/A', status: -1 };
            })
          )
        );
        setPackages(packagesData);
      } catch (err) {
        console.error('Error loading packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, [shipment?.packageIds]);

  const getPackageStatusLabel = (status: number): string => {
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'In Transit',
      2: 'Dispatched',
      3: 'Arrived',
      4: 'At Depot',
      5: 'Delivered',
      6: 'Returned',
      7: 'Collected',
    };
    return statusMap[status] || 'Unknown';
  };

  const getPackageStatusColor = (status: number): string => {
    const colorMap: Record<number, string> = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-orange-100 text-orange-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-green-100 text-green-800',
      6: 'bg-red-100 text-red-800',
      7: 'bg-cyan-100 text-cyan-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleMarkDelivered = async (packageId: string) => {
    try {
      setMarkingDelivery(prev => new Set([...prev, packageId]));
      setDeliveryError(null);

      const result = await markPackageAsDelivered(packageId, {
        deliveryNotes: 'Delivered by driver',
      });

      if (result) {
        // Update package status in local state
        setPackages(prev =>
          prev.map(p => p.id === packageId ? { ...p, status: 5 } : p)
        );
      } else {
        setDeliveryError('Failed to mark package as delivered');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.message || 'Error marking package as delivered';
      setDeliveryError(errorMsg);
    } finally {
      setMarkingDelivery(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  const handleMarkCollected = async (packageId: string) => {
    try {
      setMarkingCollection(prev => new Set([...prev, packageId]));
      setDeliveryError(null);

      const result = await markPackageAsCollected(packageId, {
        collectionNotes: 'Collected by driver',
      });

      if (result) {
        // Update package status in local state
        setPackages(prev =>
          prev.map(p => p.id === packageId ? { ...p, status: 7 } : p)
        );
      } else {
        setDeliveryError('Failed to mark package as collected');
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.message || 'Error marking package as collected';
      setDeliveryError(errorMsg);
    } finally {
      setMarkingCollection(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Shipment Type Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-blue-600 font-medium">Shipment Type</p>
          <p className="text-lg font-semibold text-blue-900">{shipmentType}</p>
        </div>
      </div>

      {/* Error Alert */}
      {deliveryError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {deliveryError}
        </div>
      )}

      {/* Packages Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Packages in Shipment ({packages.length})
          </h2>
        </div>

        {loadingPackages ? (
          <div className="text-center py-8 text-gray-500">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No packages in this shipment</div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-600">#{idx + 1}</span>
                      <span className="text-sm text-gray-500 font-mono">
                        ID: {pkg.id?.substring(0, 8)}...
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {pkg.trackingNumber || 'N/A'}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      {pkg.weight && (
                        <div>
                          <p className="text-gray-600">Weight</p>
                          <p className="font-medium text-gray-900">{pkg.weight}kg</p>
                        </div>
                      )}
                      {pkg.destinationAddress && (
                        <div>
                          <p className="text-gray-600">Destination</p>
                          <p className="font-medium text-gray-900 truncate">
                            {pkg.destinationAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getPackageStatusColor(
                        pkg.status
                      )}`}
                    >
                      {getPackageStatusLabel(pkg.status)}
                    </span>

                    {/* Show Mark Delivered button for Last-Mile and Depot-to-Depot */}
                    {isDriver && shipment?.type !== 0 && (pkg.status === 1 || pkg.status === 2) && (
                      <button
                        onClick={() => handleMarkDelivered(pkg.id)}
                        disabled={markingDelivery.has(pkg.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
                      >
                        {markingDelivery.has(pkg.id) ? 'Marking...' : 'Mark Delivered'}
                      </button>
                    )}

                    {/* Show Mark Collected button for Pickup shipments */}
                    {isDriver && shipment?.type === 0 && pkg.status === 0 && (
                      <button
                        onClick={() => handleMarkCollected(pkg.id)}
                        disabled={markingCollection.has(pkg.id)}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 text-sm font-medium"
                      >
                        {markingCollection.has(pkg.id) ? 'Collecting...' : 'Mark Collected'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
