"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, Truck, Users, Package, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getShipments } from '../api/shipments';
import { getDrivers } from '../api/drivers';
import { getVehicles } from '../api/vehicles';
import { getPackages } from '../api/packages';
import { parseShipmentStatus } from '../api/shipmentMappers';

interface ShipmentStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  canceled: number;
}

interface DashboardData {
  shipments: ShipmentStats;
  drivers: number;
  vehicles: number;
  packages: number;
  isLoading: boolean;
  error: string | null;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    shipments: { total: 0, pending: 0, active: 0, completed: 0, canceled: 0 },
    drivers: 0,
    vehicles: 0,
    packages: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [shipmentsRes, driversRes, vehiclesRes, packagesRes] = await Promise.all([
          getShipments(1, 100),
          getDrivers(),
          getVehicles(),
          getPackages(1, 100),
        ]);

        const shipmentItems = shipmentsRes?.items ?? [];
        const statuses = shipmentItems.map((s: { status?: unknown }) => parseShipmentStatus(s.status));
        const shipmentStats = {
          total: shipmentItems.length,
          pending: statuses.filter((status) => status === 0).length,
          active: statuses.filter((status) => status === 1 || status === 2).length,
          completed: statuses.filter((status) => status === 3 || status === 5).length,
          canceled: statuses.filter((status) => status === 4).length,
        };

        setData({
          shipments: shipmentStats,
          drivers: driversRes?.length ?? 0,
          vehicles: vehiclesRes?.items?.length ?? 0,
          packages: packagesRes?.items?.length ?? 0,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Dashboard data loading error:', err);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data',
        }));
      }
    };

    loadDashboardData();
  }, []);

  return (
    <main className="w-full">
      {/* Error Message */}
      {data.error && (
        <div className="mb-6 px-8 py-4 bg-red-50 border border-red-200  text-red-800 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{data.error}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 mb-8 py-8">
        {/* Total Shipments */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Shipments</p>
              <p className="text-white text-3xl font-bold mt-1">{data.shipments.total}</p>
            </div>
            <Truck size={40} className="text-blue-200 opacity-60" />
          </div>
          <div className="p-4">
            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex justify-between">
                <span>Active routes:</span>
                <span className="font-semibold text-blue-600">{data.shipments.active}</span>
              </p>
              <p className="flex justify-between">
                <span>Completed:</span>
                <span className="font-semibold text-green-600">{data.shipments.completed}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Drivers */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Drivers</p>
              <p className="text-white text-3xl font-bold mt-1">{data.drivers}</p>
            </div>
            <Users size={40} className="text-purple-200 opacity-60" />
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600">
              Active and available drivers
            </p>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Vehicles</p>
              <p className="text-white text-3xl font-bold mt-1">{data.vehicles}</p>
            </div>
            <Truck size={40} className="text-green-200 opacity-60" />
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600">
              Fleet size across all locations
            </p>
          </div>
        </div>

        {/* Packages */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Packages</p>
              <p className="text-white text-3xl font-bold mt-1">{data.packages}</p>
            </div>
            <Package size={40} className="text-orange-200 opacity-60" />
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-600">
              Packages in the system
            </p>
          </div>
        </div>
      </div>

      {/* Shipment Status Breakdown */}
      <div className="px-8 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 size={24} className="text-blue-600" />
            Shipment Status Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pending */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800">Pending</span>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-700">{data.shipments.pending}</p>
              <p className="text-xs text-yellow-600 mt-2">
                {data.shipments.total > 0
                  ? `${Math.round((data.shipments.pending / data.shipments.total) * 100)}%`
                  : '-'}
                {' '}of total
              </p>
            </div>

            {/* Active */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Active</span>
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{data.shipments.active}</p>
              <p className="text-xs text-blue-600 mt-2">
                {data.shipments.total > 0
                  ? `${Math.round((data.shipments.active / data.shipments.total) * 100)}%`
                  : '-'}
                {' '}of total
              </p>
            </div>

            {/* Completed */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Completed</span>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{data.shipments.completed}</p>
              <p className="text-xs text-green-600 mt-2">
                {data.shipments.total > 0
                  ? `${Math.round((data.shipments.completed / data.shipments.total) * 100)}%`
                  : '-'}
                {' '}of total
              </p>
            </div>

            {/* Canceled */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Canceled</span>
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">{data.shipments.canceled}</p>
              <p className="text-xs text-red-600 mt-2">
                {data.shipments.total > 0
                  ? `${Math.round((data.shipments.canceled / data.shipments.total) * 100)}%`
                  : '-'}
                {' '}of total
              </p>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">Total</span>
                <BarChart3 size={20} className="text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-700">{data.shipments.total}</p>
              <p className="text-xs text-gray-600 mt-2">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 pb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/shipments"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
            >
              Manage Shipments
            </a>
            <a
              href="/drivers"
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-center font-medium"
            >
              Manage Drivers
            </a>
            <a
              href="/vehicles"
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-medium"
            >
              Manage Vehicles
            </a>
            <a
              href="/packages"
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-center font-medium"
            >
              Manage Packages
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
