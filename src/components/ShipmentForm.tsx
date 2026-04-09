"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createShipmentSchema, { CreateShipmentSchema } from '../schemas/shipment';
import { useCreateShipment } from '../hooks/useShipments';
import { usePackages } from '../hooks/usePackages';
import { useDrivers } from '../hooks/useDrivers';

import type { CreateShipmentDto } from '../types/shipments';
import { useRouter } from 'next/navigation';
import { useVehicles } from '../hooks/useVehicles';

export default function ShipmentForm() {
  const router = useRouter();
  const mutation = useCreateShipment();
  const { data: packagesData } = usePackages(1, 100); // Fetch all pending packages
  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();

  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolver = zodResolver(createShipmentSchema) as Resolver<CreateShipmentSchema>;
  const { register, handleSubmit, formState, setValue, watch } = useForm<CreateShipmentSchema>({
    resolver,
  });

  // Toggle package selection
  const togglePackage = (packageId: string) => {
    const newSet = new Set(selectedPackages);
    if (newSet.has(packageId)) {
      newSet.delete(packageId);
    } else {
      newSet.add(packageId);
    }
    setSelectedPackages(newSet);
  };

  // Open modal when "Armar Viaje" is clicked
  const handleArmShipment = () => {
    if (selectedPackages.size === 0) {
      setSubmitError('Please select at least one package');
      return;
    }
    setSubmitError(null);
    setShowModal(true);
  };

  // Handle form submission from modal
  const onSubmit = async (data: CreateShipmentSchema) => {
    const payload: CreateShipmentDto = {
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      packageIds: Array.from(selectedPackages),
      estimatedDelivery: new Date(data.estimatedDelivery).toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (mutation.mutateAsync) {
        await mutation.mutateAsync(payload);
      } else {
        await new Promise<void>((resolve, reject) => {
          mutation.mutate(payload, {
            onSuccess() {
              resolve();
            },
            onError(err) {
              reject(err);
            },
          });
        });
      }
      // Reset form and redirect
      setSelectedPackages(new Set());
      setShowModal(false);
      router.push('/shipments');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Error creating shipment');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter packages to show only pending ones
  const packages = packagesData?.items?.filter(p => p.status === 'Pending') ?? [];
  const drivers = driversData?.items ?? [];
  const vehicles = vehiclesData?.items ?? [];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Creador de Viajes</h2>

      {/* Packages Selection Table */}
      <div className="bg-white rounded border border-gray-300 shadow mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-12 px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPackages.size === packages.length && packages.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPackages(new Set(packages.map(p => p.id)));
                      } else {
                        setSelectedPackages(new Set());
                      }
                    }}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tracking</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Origin</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Destination</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Weight (kg)</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500 text-sm">
                    No pending packages available
                  </td>
                </tr>
              ) : (
                packages.map(pkg => (
                  <tr key={pkg.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedPackages.has(pkg.id)}
                        onChange={() => togglePackage(pkg.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{pkg.trackingNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.origin}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.destination}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.weight}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {pkg.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedPackages.size} of {packages.length} packages selected
          </span>
          <button
            type="button"
            onClick={handleArmShipment}
            disabled={selectedPackages.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Armar Viaje
          </button>
        </div>
      </div>

      {submitError && <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded">{submitError}</div>}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Assign Driver & Vehicle</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 font-medium">Driver</span>
                <select
                  {...register('driverId')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.firstName || driver.lastName ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() : driver.name}
                    </option>
                  ))}
                </select>
                {formState.errors.driverId && (
                  <p className="text-sm text-red-600 mt-1">{String(formState.errors.driverId.message)}</p>
                )}
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium">Vehicle</span>
                <select
                  {...register('vehicleId')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.model}
                    </option>
                  ))}
                </select>
                {formState.errors.vehicleId && (
                  <p className="text-sm text-red-600 mt-1">{String(formState.errors.vehicleId.message)}</p>
                )}
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium">Estimated Delivery</span>
                <input
                  type="datetime-local"
                  {...register('estimatedDelivery')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                />
                {formState.errors.estimatedDelivery && (
                  <p className="text-sm text-red-600 mt-1">{String(formState.errors.estimatedDelivery.message)}</p>
                )}
              </label>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
                >
                  {submitting ? 'Creating...' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
