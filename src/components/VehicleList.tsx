"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '../hooks/useVehicles';

export default function VehicleList() {
  const router = useRouter();
  const { data, isLoading, error } = useVehicles();

  if (isLoading) return <div className="p-4">Loading vehicles...</div>;
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;

  const items = data?.items ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Vehicles</h2>
        <button
          onClick={() => router.push('/vehicles/new')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
        >
          + New Vehicle
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">No vehicles available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left px-4 py-3">License Plate</th>
                <th className="text-left px-4 py-3">Max Weight (kg)</th>
                <th className="text-left px-4 py-3">Max Volume (m³)</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((vehicle, idx) => (
                <tr key={vehicle.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b`}>
                  <td className="px-4 py-4 align-middle font-semibold text-gray-800">{vehicle.plate}</td>
                  <td className="px-4 py-4 align-middle text-gray-600">{vehicle.maxWeightCapacity}</td>
                  <td className="px-4 py-4 align-middle text-gray-600">{vehicle.maxVolumeCapacity}</td>
                  <td className="px-4 py-4 align-middle text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vehicle.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle text-right">
                    <button
                      onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                      className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
