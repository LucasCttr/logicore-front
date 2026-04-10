"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createShipmentSchema, { CreateShipmentSchema } from '../schemas/shipment';
import { useCreateShipment } from '../hooks/useShipments';
import { usePackages } from '../hooks/usePackages';
import { useDrivers } from '../hooks/useDrivers';
import { useLocations } from '../hooks/useLocations';

import type { CreateShipmentDto } from '../types/shipments';
import type { LocationDto } from '../types/locations';
import { useRouter } from 'next/navigation';
import { useVehicles } from '../hooks/useVehicles';

export default function ShipmentForm() {
  const router = useRouter();
  const mutation = useCreateShipment();
  const { data: packagesData } = usePackages(1, 100);
  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: locationsData } = useLocations();

  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shipmentType, setShipmentType] = useState<'depot-to-depot' | 'last-mile'>('last-mile');

  const resolver = zodResolver(createShipmentSchema) as Resolver<CreateShipmentSchema>;
  const { register, handleSubmit, formState, watch } = useForm<CreateShipmentSchema>({
    resolver,
    mode: 'onBlur', // Validate on blur to avoid constant errors
    defaultValues: {
      driverId: '',
      vehicleId: '',
      estimatedDelivery: '',
      destinationLocationId: '',
    },
  });

  // Watch form values for debugging
  const formValues = watch();

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
    console.log('Form data received:', data);
    console.log('Form errors:', formState.errors);
    
    try {
      // Validate packages are selected
      if (selectedPackages.size === 0) {
        setSubmitError('Please select at least one package');
        return;
      }

      // Validate date is in future
      const deliveryDate = new Date(data.estimatedDelivery);
      if (isNaN(deliveryDate.getTime())) {
        setSubmitError('Invalid date format. Please select a valid date.');
        return;
      }
      
      if (deliveryDate <= new Date()) {
        setSubmitError('Estimated delivery must be in the future.');
        return;
      }

      const payload: CreateShipmentDto = {
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        packageIds: Array.from(selectedPackages),
        estimatedDelivery: deliveryDate.toISOString(),
        destinationLocationId: shipmentType === 'depot-to-depot' && data.destinationLocationId 
          ? parseInt(data.destinationLocationId) 
          : null,
      };

      console.log('Shipment payload:', payload);

      setSubmitting(true);
      setSubmitError(null);
      
      if (mutation.mutateAsync) {
        await mutation.mutateAsync(payload);
      } else {
        await new Promise<void>((resolve, reject) => {
          mutation.mutate(payload, {
            onSuccess() {
              console.log('Shipment created successfully');
              resolve();
            },
            onError(err: any) {
              console.error('Mutation error:', err);
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
      console.error('Submission error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Error creating shipment';
      setSubmitError(errorMessage);
      setSubmitting(false);
    }
  };

  // Helper to convert status code to label
  const getStatusLabel = (status: number | string | null | undefined) => {
    if (!status && status !== 0) return 'Unknown';
    if (typeof status === 'string' && isNaN(Number(status))) return status;
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'In Transit',
      2: 'Delivered',
      3: 'Canceled'
    };
    return statusMap[Number(status)] || 'Unknown';
  };

  // Helper to detect common destination from selected packages
  const getCommonDestination = (): string | null => {
    if (selectedPackages.size === 0) return null;
    
    const selectedPkgs = packages.filter(p => selectedPackages.has(p.id));
    const destinations = selectedPkgs
      .map(p => p.destinationAddress)
      .filter((d): d is string => Boolean(d && d.trim() !== ''));
    
    if (destinations.length === 0) return null;
    
    // Check if all have the same destination
    const firstDestination = destinations[0];
    const allSame = destinations.every(d => d === firstDestination);
    
    return allSame ? firstDestination : null;
  };

  // Filter packages to show only pending ones (status: 0)
  const packages = packagesData?.items?.filter(p => Number(p.status) === 0) ?? [];
  const drivers = driversData?.items ?? [];
  const vehicles = vehiclesData?.items ?? [];
  const locations = Array.isArray(locationsData) ? locationsData : [];
  const commonDestination = getCommonDestination();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Shipment Creator</h2>

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
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tracking Number</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Origin Address</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Destination Address</th>
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
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.originAddress || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.destinationAddress || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{pkg.weight}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {getStatusLabel(pkg.status)}
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
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* Destination Suggestion */}
      {selectedPackages.size > 0 && commonDestination && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm5 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Smart Destination Detection</h3>
              <p className="text-sm text-blue-800">
                All {selectedPackages.size} selected packages are heading to:
              </p>
              <p className="font-medium text-blue-900 mt-2 px-3 py-2 bg-white rounded border border-blue-300">
                📍 {commonDestination}
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Assign Driver and Vehicle</h3>

            {/* Packages Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">📦 Packages Summary</p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{selectedPackages.size}</span> packages selected
              </p>
              {commonDestination && (
                <p className="text-sm text-gray-600 mt-2">
                  Destination: <span className="font-semibold text-gray-900">{commonDestination}</span>
                </p>
              )}
            </div>

            {/* Shipment Type Selection */}
            <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm font-medium text-gray-700 mb-3">🚚 Shipment Type</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="last-mile"
                    checked={shipmentType === 'last-mile'}
                    onChange={(e) => setShipmentType(e.target.value as 'last-mile')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Last-Mile Delivery</p>
                    <p className="text-xs text-gray-600">Door-to-door delivery to customers</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="depot-to-depot"
                    checked={shipmentType === 'depot-to-depot'}
                    onChange={(e) => setShipmentType(e.target.value as 'depot-to-depot')}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Depot-to-Depot</p>
                    <p className="text-xs text-gray-600">Transport between storage locations</p>
                  </div>
                </label>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                <p className="font-semibold">Error:</p>
                <p>{submitError}</p>
              </div>
            )}

            {Object.keys(formState.errors).length > 0 && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
                <p className="font-semibold">Validation Errors:</p>
                <ul className="list-disc list-inside mt-2">
                  {Object.entries(formState.errors).map(([field, error]: any) => (
                    <li key={field}>{field}: {error?.message || 'Invalid'}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700 font-medium">Driver *</span>
                <select
                  {...register('driverId')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                  defaultValue=""
                >
                  <option value="">Select a driver...</option>
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
                <span className="text-sm text-gray-700 font-medium">Vehicle *</span>
                <select
                  {...register('vehicleId')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                  defaultValue=""
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - Weight: {vehicle.maxWeightCapacity}kg, Volume: {vehicle.maxVolumeCapacity}m³
                    </option>
                  ))}
                </select>
                {formState.errors.vehicleId && (
                  <p className="text-sm text-red-600 mt-1">{String(formState.errors.vehicleId.message)}</p>
                )}
              </label>

              <label className="block">
                <span className="text-sm text-gray-700 font-medium">Estimated Delivery Date *</span>
                <input
                  type="datetime-local"
                  {...register('estimatedDelivery')}
                  className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                />
                {formState.errors.estimatedDelivery && (
                  <p className="text-sm text-red-600 mt-1">{String(formState.errors.estimatedDelivery.message)}</p>
                )}
              </label>

              {shipmentType === 'depot-to-depot' && (
                <label className="block">
                  <span className="text-sm text-gray-700 font-medium">Destination Location</span>
                  <select
                    {...register('destinationLocationId')}
                    className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
                    defaultValue=""
                  >
                    <option value="">Select a destination location...</option>
                    {locations.map((location: LocationDto) => {
                      const address = [location.addressLine1, location.city, location.postalCode]
                        .filter(Boolean)
                        .join(', ');
                      return (
                        <option key={location.id} value={location.id}>
                          {location.name} - {address}
                        </option>
                      );
                    })}
                  </select>
                  {formState.errors.destinationLocationId && (
                    <p className="text-sm text-red-600 mt-1">{String(formState.errors.destinationLocationId.message)}</p>
                  )}
                </label>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Object.keys(formState.errors).length > 0}
                  onClick={() => {
                    console.log('Submit button clicked');
                    console.log('Form values:', formValues);
                    console.log('Form errors:', formState.errors);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
                  title={Object.keys(formState.errors).length > 0 ? 'Please fix validation errors' : ''}
                >
                  {submitting ? 'Creating...' : Object.keys(formState.errors).length > 0 ? '❌ Fix Errors' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
