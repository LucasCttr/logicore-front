"use client";

import Link from 'next/link';
import React, { useMemo } from 'react';
import { useMyShipments } from '../hooks/useShipments';
import { parseShipmentStatus } from '../api/shipmentMappers';

interface VehicleInfo {
  id: string;
  licensePlate?: string | null;
  model?: string | null;
  make?: string | null;
}

interface DriverDashboardProps {
  shipmentCount?: number;
  vehicleAssigned?: boolean;
  assignedVehicle?: VehicleInfo | null;
}

export default function DriverDashboard({ shipmentCount = 0, vehicleAssigned = false, assignedVehicle = null }: DriverDashboardProps) {
  const { data: shipments = [], isLoading, error } = useMyShipments();

  const activeShipment = useMemo(() => {
    const sorted = [...shipments].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sorted.find((shipment) => {
      const status = parseShipmentStatus(shipment.status);
      return status === 1 || status === 2 || status === 3;
    }) ?? null;
  }, [shipments]);

  const activeTripCount = activeShipment ? 1 : 0;

  const getShipmentStatusLabel = (status: unknown): string => {
    const parsed = parseShipmentStatus(status);
    switch (parsed) {
      case 0:
        return 'Pending';
      case 1:
        return 'Loading';
      case 2:
        return 'Dispatched';
      case 3:
        return 'Arrived';
      case 4:
        return 'Canceled';
      case 5:
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const getShipmentTypeLabel = (type: unknown): string => {
    switch (type) {
      case 0:
        return 'Pickup';
      case 1:
        return 'Transfer';
      case 2:
        return 'Last-Mile';
      default:
        return 'Trip';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Welcome, Driver!</h1>
        <p className="text-gray-600 mt-2">Here's a quick overview of your responsibilities</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Trip</p>
            <p className="text-lg font-semibold text-slate-900">{activeTripCount > 0 ? 'Your current journey' : 'No active trip right now'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Trips</p>
            <p className="text-2xl font-bold text-blue-700">{activeTripCount || shipmentCount}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-500">Loading active trip...</div>
        ) : error ? (
          <div className="p-6 text-red-600">Unable to load your current trip.</div>
        ) : activeShipment ? (
          <Link
            href={`/shipments/${activeShipment.id}`}
            className="block p-6 bg-gradient-to-br from-blue-50 via-white to-slate-50 hover:from-blue-100 hover:to-white transition"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Route Code</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeShipment.routeCode || activeShipment.id}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                    {getShipmentTypeLabel(activeShipment.type)}
                  </span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                    {getShipmentStatusLabel(activeShipment.status)}
                  </span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {activeShipment.packageIds?.length ?? 0} packages
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-500">Shipment ID</p>
                    <p className="font-mono text-sm break-all">{activeShipment.id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-500">Estimated Delivery</p>
                    <p>{activeShipment.estimatedDelivery ? new Date(activeShipment.estimatedDelivery).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-blue-700 font-semibold">
                <span>Open full trip</span>
                <span className="text-2xl">→</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
            <p className="text-slate-700 font-medium">No active trip assigned.</p>
            <p className="text-slate-500 text-sm mt-1">When dispatch starts, your current trip will appear here.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

        {/* Scanner Card */}
        <Link href="/driver/scanner" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Package Scanner</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">📱</p>
            </div>
            <div className="text-5xl text-purple-200">✓</div>
          </div>
          <p className="text-purple-600 text-sm mt-3">Scan packages</p>
        </Link>

        {/* Profile Card */}
        <Link href="/driver/profile" className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">My Profile</p>
              <p className="text-3xl font-bold text-green-700 mt-2">👤</p>
            </div>
            <div className="text-5xl text-green-200">📋</div>
          </div>
          <p className="text-green-600 text-sm mt-3">View license & details</p>
        </Link>
      </div>

      {/* Vehicle Status */}
      {vehicleAssigned && assignedVehicle && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Vehicle Assignment</p>
          <div className="mt-4 space-y-3">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">License Plate</p>
                  <p className="text-2xl font-bold text-blue-700 mt-2">{assignedVehicle.licensePlate || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">Make</p>
                  <p className="text-lg font-semibold text-gray-800 mt-2">{assignedVehicle.make || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase">Model</p>
                  <p className="text-lg font-semibold text-gray-800 mt-2">{assignedVehicle.model || '-'}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Contact admin if you need vehicle reassignment</p>
          </div>
        </div>
      )}
      {vehicleAssigned && !assignedVehicle && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Vehicle Assignment</p>
          <p className="text-lg text-gray-800 mt-2 font-semibold">✓ Vehicle assigned</p>
          <p className="text-gray-500 text-sm mt-1">Check your profile for details</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>📍 Open your active trip to see the full shipment details</li>
          <li>🔍 Use the scanner to track package movements throughout the day</li>
          <li>🔄 Check your profile regularly to ensure your license hasn't expired</li>
          <li>❓ Contact admin if you need vehicle reassignment</li>
        </ul>
      </div>
    </div>
  );
}
