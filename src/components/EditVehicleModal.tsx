"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUpdateVehicle } from '../hooks/useVehicles';
import type { Vehicle } from '../api/vehicles';

interface EditVehicleModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditVehicleModal({
  isOpen,
  vehicle,
  onClose,
  onSuccess,
}: EditVehicleModalProps) {
  const updateMutation = useUpdateVehicle();
  const [formData, setFormData] = useState({
    plate: vehicle?.licensePlate || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    maxWeightCapacity: vehicle?.maxWeightCapacity || 0,
    maxVolumeCapacity: vehicle?.maxVolumeCapacity || 0,
    isActive: vehicle?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.licensePlate || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        maxWeightCapacity: vehicle.maxWeightCapacity || 0,
        maxVolumeCapacity: vehicle.maxVolumeCapacity || 0,
        isActive: vehicle.isActive ?? true,
      });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'plate' || name === 'make' || name === 'model' ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: vehicle.id,
        payload: {
          plate: formData.plate,
          make: formData.make,
          model: formData.model,
          maxWeightCapacity: formData.maxWeightCapacity,
          maxVolumeCapacity: formData.maxVolumeCapacity,
          isActive: formData.isActive,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Vehicle
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">License Plate</span>
            <input
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              placeholder="E.g., ABC-1234"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Make</span>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="E.g., Toyota"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Model</span>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="E.g., Hiace"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Max Weight Capacity (kg)</span>
            <input
              type="number"
              name="maxWeightCapacity"
              value={formData.maxWeightCapacity}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Max Volume Capacity (m³)</span>
            <input
              type="number"
              name="maxVolumeCapacity"
              value={formData.maxVolumeCapacity}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
