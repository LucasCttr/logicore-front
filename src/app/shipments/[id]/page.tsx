"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import api from '../../../api/axiosClient';
import { getDriverById } from '../../../api/drivers';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ShipmentDetails {
  id: string;
  routeCode: string | null;
  status: number;
  driverId: string | null;
  vehicleId: string | null;
  destinationLocationId: number | null;
  createdAt: string | null;
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  arrivedAt: string | null;
  vehicleMaxWeightCapacity: number | null;
  vehicleMaxVolumeCapacity: number | null;
  packageIds: string[] | null;
  packages?: Array<{
    id: string;
    trackingNumber: string;
    weight: number;
    volume: number;
    status: number;
  }>;
  [key: string]: any;
}

interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

function getRolesFromToken(token: string): string[] {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    return String(roles).split(',').map((s: string) => s.trim());
  } catch (e) {
    return [];
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
  } catch (e) {
    return null;
  }
}

export default function ShipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentDriverId, setCurrentDriverId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Get current user role and ID
        const roles = getRolesFromToken(token);
        setCurrentUserRole(roles[0] || null);
        
        const userId = getUserIdFromToken(token);
        if (userId && roles.includes('Driver')) {
          // If user is a driver, get their driver ID
          try {
            const driverData = await getDriverById(userId);
            setCurrentDriverId(driverData?.id || null);
          } catch (err) {
            console.error('Error getting driver ID:', err);
          }
        }

        const response = await api.get(`/api/shipments/${shipmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let shipmentData: ShipmentDetails | null = null;
        if (response.data?.isSuccess) {
          shipmentData = response.data.value;
        } else if (response.data?.value) {
          shipmentData = response.data.value;
        } else {
          setError(response.data?.error || 'Failed to load shipment');
          return;
        }

        // Validate access: Admin can see all, Driver can only see their own
        if (roles.includes('Driver') && !roles.includes('Admin')) {
          if (currentDriverId && shipmentData?.driverId !== currentDriverId) {
            setError('You do not have permission to view this shipment');
            setTimeout(() => router.push('/shipments'), 2000);
            return;
          }
        }

        setShipment(shipmentData);

        // Fetch driver details if driverId exists
        if (shipmentData?.driverId) {
          try {
            const driverData = await getDriverById(shipmentData.driverId);
            setDriver(driverData);
          } catch (driverError) {
            console.error('Error loading driver details:', driverError);
            // Continue without driver details if error
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Error loading shipment');
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId) {
      fetchShipment();
    }
  }, [shipmentId, router, currentDriverId]);

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      case 3:
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  return (
    <AuthGuard requireRoles={["Admin", "Driver"]}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/shipments"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronLeft size={20} />
            Back to Shipments
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && shipment && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {shipment.routeCode || 'Shipment ' + shipment.id.substring(0, 8)}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 font-mono">{shipment.id}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(shipment.status)}`}
                >
                  {getStatusLabel(shipment.status)}
                </span>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Route Code</label>
                    <p className="text-lg text-gray-900 mt-1 font-mono">{shipment.routeCode || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-lg text-gray-900 mt-1">{getStatusLabel(shipment.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Destination Location ID</label>
                    <p className="text-lg text-gray-900 mt-1">{shipment.destinationLocationId || 'Last-Mile (Door-to-Door)'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Packages</label>
                    <p className="text-lg text-gray-900 mt-1">{shipment.packageIds?.length ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vehicle ID</label>
                    <p className="text-lg text-gray-900 mt-1 font-mono">{shipment.vehicleId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Weight Capacity</label>
                    <p className="text-lg text-gray-900 mt-1">
                      {shipment.vehicleMaxWeightCapacity ? `${shipment.vehicleMaxWeightCapacity} kg` : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Volume Capacity</label>
                    <p className="text-lg text-gray-900 mt-1">
                      {shipment.vehicleMaxVolumeCapacity ? `${shipment.vehicleMaxVolumeCapacity} m³` : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Driver</label>
                    <p className="text-lg text-gray-900 mt-1">
                      {driver 
                        ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || driver.name || '-'
                        : shipment.driverId ? shipment.driverId.substring(0, 8) + '...' : '-'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <div className="w-1 h-12 bg-gray-300 mt-1"></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-lg text-gray-900 mt-1">{formatDate(shipment.createdAt)}</p>
                  </div>
                </div>

                {shipment.shippedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                      <div className="w-1 h-12 bg-gray-300 mt-1"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Shipped</label>
                      <p className="text-lg text-gray-900 mt-1">{formatDate(shipment.shippedAt)}</p>
                    </div>
                  </div>
                )}

                {shipment.arrivedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      <div className="w-1 h-12 bg-gray-300 mt-1"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Arrived</label>
                      <p className="text-lg text-gray-900 mt-1">{formatDate(shipment.arrivedAt)}</p>
                    </div>
                  </div>
                )}

                {shipment.deliveredAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Delivered</label>
                      <p className="text-lg text-gray-900 mt-1">{formatDate(shipment.deliveredAt)}</p>
                    </div>
                  </div>
                )}

                {shipment.estimatedDelivery && !shipment.deliveredAt && (
                  <div className="flex items-start gap-4 opacity-60">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estimated Delivery</label>
                      <p className="text-lg text-gray-900 mt-1">{formatDate(shipment.estimatedDelivery)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Packages */}
            {shipment.packageIds && shipment.packageIds.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Packages ({shipment.packageIds.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Package ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tracking Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipment.packageIds.map((pid, idx) => (
                        <tr key={pid} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{pid.substring(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm text-gray-600">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
