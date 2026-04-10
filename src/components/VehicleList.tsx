"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '../hooks/useVehicles';
import ListContainer from './ListContainer';

export default function VehicleList() {
  const router = useRouter();
  const { data, isLoading, error } = useVehicles();

  const items = data?.items ?? [];

  return (
    <ListContainer
      title="Vehicles"
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No vehicles available."
      actions={
        <button
          onClick={() => router.push('/vehicles/new')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          + New Vehicle
        </button>
      }
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">License Plate</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Max Weight (kg)</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Max Volume (m³)</th>
            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((vehicle, idx) => (
            <tr key={vehicle.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
              <td className="px-6 py-4 font-semibold text-gray-800">{vehicle.plate}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.maxWeightCapacity}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.maxVolumeCapacity}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListContainer>
  );
}
