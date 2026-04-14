"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useAssignVehicleToDriver } from '../hooks/useDriver';
import type { Vehicle } from '../api/vehicles';

interface AssignVehicleModalProps {
  isOpen: boolean;
  driverId: string;
  driverName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AssignVehicleModal({
  isOpen,
  driverId,
  driverName,
  onClose,
  onSuccess,
}: AssignVehicleModalProps) {
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles();
  const assignMutation = useAssignVehicleToDriver();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const vehicles = vehiclesData?.items || [];

  const handleAssign = async () => {
    if (!selectedVehicleId) {
      setError('Please select a vehicle');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      await assignMutation.mutateAsync({
        driverId,
        vehicleId: selectedVehicleId,
      });
      setSelectedVehicleId(null);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign vehicle');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSkip = () => {
    setSelectedVehicleId(null);
    setError(null);
    onClose();
  };

  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Assign Vehicle
          </h2>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {driverName && (
            <p className="text-sm text-gray-600 mb-4">
              Driver: <span className="font-semibold text-slate-900">{driverName}</span>
            </p>
          )}

          {vehiclesLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">No vehicles available</p>
            </div>
          ) : (
            <>
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Select a vehicle
                </span>
                <select
                  value={selectedVehicleId || ''}
                  onChange={(e) => setSelectedVehicleId(e.target.value || null)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a vehicle --</option>
                  {vehicles.map((vehicle) => {
                    const displayName = vehicle.make && vehicle.model
                      ? `${vehicle.make} ${vehicle.model}`
                      : vehicle.licensePlate 
                        ? vehicle.licensePlate
                        : `⚠️ Needs Update (${vehicle.id?.substring(0, 8)})`;
                    return (
                      <option key={vehicle.id} value={vehicle.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </label>

              {selectedVehicle && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  {selectedVehicle.make || selectedVehicle.model || selectedVehicle.licensePlate ? (
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">
                        {selectedVehicle.make && selectedVehicle.model
                          ? `${selectedVehicle.make} ${selectedVehicle.model}`
                          : selectedVehicle.licensePlate || (selectedVehicle.make || selectedVehicle.model)}{' '}
                      </span>
                      {selectedVehicle.licensePlate && `• Plate: ${selectedVehicle.licensePlate}`}
                    </p>
                  ) : (
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">⚠️ Vehicle needs data update</span>
                      <br />
                      <span className="text-xs text-blue-700">ID: {selectedVehicle.id}</span>
                    </p>
                  )}
                  {selectedVehicle.maxWeightCapacity && (
                    <p className="text-xs text-blue-700 mt-1">
                      Max Weight: {selectedVehicle.maxWeightCapacity} kg
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            Skip
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedVehicleId || isAssigning || vehiclesLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
