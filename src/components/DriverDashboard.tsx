"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Welcome, Driver!</h1>
        <p className="text-gray-600 mt-2">Here's a quick overview of your responsibilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Active Shipments Card */}
        <Link href="/driver/shipments" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Shipments</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{shipmentCount}</p>
            </div>
            <div className="text-5xl text-blue-200">📦</div>
          </div>
          <p className="text-blue-600 text-sm mt-3">View your shipments</p>
        </Link>

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
          <li>📍 Start by viewing your active shipments to plan your route</li>
          <li>🔍 Use the scanner to track package movements throughout the day</li>
          <li>🔄 Check your profile regularly to ensure your license hasn't expired</li>
          <li>❓ Contact admin if you need vehicle reassignment</li>
        </ul>
      </div>
    </div>
  );
}
