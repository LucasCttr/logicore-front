"use client";

import React, { useState, useEffect } from 'react';
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
  const { register, handleSubmit, formState, watch, setValue } = useForm<CreateShipmentSchema>({
    resolver,
    mode: 'onBlur', // Validate on blur to avoid constant errors
    defaultValues: {
      driverId: '',
      vehicleId: '',
      estimatedDelivery: '',
      destinationLocationId: '',
    },
  });

  // Filter packages to show only Pending (0) and AtDepot (4) ones
  const packages = packagesData?.items?.filter(p => {
    const status = Number(p.status);
    return status === 0 || status === 4; // Pending or At Depot
  }) ?? [];
  const drivers = driversData?.items ?? [];
  const vehicles = vehiclesData?.items ?? [];
  const locations = Array.isArray(locationsData) ? locationsData : [];

  // Watch form values for debugging
  const formValues = watch();
  const selectedDriverId = watch('driverId');

  // Auto-assign vehicle when driver is selected
  useEffect(() => {
    if (selectedDriverId) {
      const selectedDriver = drivers.find(d => d.id === selectedDriverId);
      if (selectedDriver?.assignedVehicleId) {
        setValue('vehicleId', selectedDriver.assignedVehicleId);
      }
    }
  }, [selectedDriverId, drivers, setValue]);

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
      3: 'Canceled',
      4: 'At Depot',
      5: 'Delivered to Center',
      6: 'Returned'
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

  const commonDestination = getCommonDestination();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Create Shipment</h1>
          </div>
          <p className="text-slate-600 ml-11">Select packages and assign a driver to create your shipment</p>
        </div>

        {/* Packages Selection Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 mb-6">
          {/* Table Header Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">📦 Available Packages</h2>
                <p className="text-sm text-slate-600 mt-1">Select the packages you want to include in this shipment</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{packages.length}</p>
                <p className="text-xs text-slate-600">available packages</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-12 px-6 py-4 text-left">
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
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tracking Number</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Origin Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Destination Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 5v10m8-10v10" />
                      </svg>
                      <p className="text-slate-600 font-medium">No packages available</p>
                      <p className="text-sm text-slate-500 mt-1">All packages have been shipped or are unavailable</p>
                    </td>
                  </tr>
                ) : (
                  packages.map(pkg => (
                    <tr key={pkg.id} className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPackages.has(pkg.id)}
                          onChange={() => togglePackage(pkg.id)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {pkg.trackingNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pkg.originAddress || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pkg.destinationAddress || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{pkg.weight} kg</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          🟡 {getStatusLabel(pkg.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                {selectedPackages.size}
              </div>
              <span className="text-slate-700">
                of <span className="font-semibold">{packages.length}</span> packages selected
              </span>
            </div>
            <button
              type="button"
              onClick={handleArmShipment}
              disabled={selectedPackages.size === 0}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                selectedPackages.size === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-95'
              }`}
            >
              <span>Continue</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

      {/* Destination Suggestion */}
      {selectedPackages.size > 0 && commonDestination && (
        <div className="bg-white rounded-lg shadow-md border border-emerald-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-6 py-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 text-lg">Destination Detected</h3>
              <p className="text-sm text-emerald-700 mt-1">
                All {selectedPackages.size} selected packages are going to the same place
              </p>
              <div className="mt-3 flex items-center gap-3 bg-white rounded-lg p-3 border border-emerald-300">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="font-semibold text-emerald-900 text-sm">{commonDestination}</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-white">Assign Driver</h2>
                  <p className="text-blue-100 text-sm mt-1">Complete the shipment details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Packages Summary */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 9V7a2 2 0 012-2h6a2 2 0 012 2v2M5 9c0 1.657-.895 3-2 3s-2-1.343-2-3m0 0V5c0-1.657.895-3 2-3s2 1.343 2 3m0 0h6m0 0v2m0-2c0-1.657.895-3 2-3s2 1.343 2 3m0 0v0h0m0 0c0 1.657-.895 3-2 3s-2-1.343-2-3m0 0V7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Packages Summary</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{selectedPackages.size}</p>
                  <p className="text-xs text-blue-700 mt-1">package{selectedPackages.size !== 1 ? 's' : ''} selected</p>
                  {commonDestination && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">📍 Destination:</p>
                      <p className="text-sm font-semibold text-blue-900 line-clamp-2">{commonDestination}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">🚚 Shipment Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-colors duration-150" style={{
                    borderColor: shipmentType === 'last-mile' ? 'rgb(59, 130, 246)' : undefined,
                    backgroundColor: shipmentType === 'last-mile' ? 'rgb(239, 246, 255)' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      value="last-mile"
                      checked={shipmentType === 'last-mile'}
                      onChange={(e) => setShipmentType(e.target.value as 'last-mile')}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Last-Mile Delivery</p>
                      <p className="text-xs text-slate-600">Door-to-door delivery to customers</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-colors duration-150" style={{
                    borderColor: shipmentType === 'depot-to-depot' ? 'rgb(59, 130, 246)' : undefined,
                    backgroundColor: shipmentType === 'depot-to-depot' ? 'rgb(239, 246, 255)' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      value="depot-to-depot"
                      checked={shipmentType === 'depot-to-depot'}
                      onChange={(e) => setShipmentType(e.target.value as 'depot-to-depot')}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Depot-to-Depot</p>
                      <p className="text-xs text-slate-600">Transport between distribution centers</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Messages */}
              {submitError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(formState.errors).length > 0 && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-800">Validation Errors</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {Object.entries(formState.errors).map(([field, error]: any) => (
                          <li key={field} className="text-sm text-amber-700">{field}: {error?.message || 'Invalid'}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Driver Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">👨‍✈️ Driver *</label>
                  <select
                    {...register('driverId')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
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
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {String(formState.errors.driverId.message)}
                    </p>
                  )}
                </div>

                {/* Vehicle Display */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">🚗 Assigned Vehicle</label>
                  <input {...register('vehicleId')} type="hidden" />
                  <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
                    {selectedDriverId && drivers.find(d => d.id === selectedDriverId)?.assignedVehicle ? (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{drivers.find(d => d.id === selectedDriverId)?.assignedVehicle?.licensePlate}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {drivers.find(d => d.id === selectedDriverId)?.assignedVehicle?.make} {drivers.find(d => d.id === selectedDriverId)?.assignedVehicle?.model}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">👆 Select a driver to see their assigned vehicle</p>
                    )}
                  </div>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">📅 Estimated Delivery Date *</label>
                  <input
                    type="datetime-local"
                    {...register('estimatedDelivery')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                  />
                  {formState.errors.estimatedDelivery && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> {String(formState.errors.estimatedDelivery.message)}
                    </p>
                  )}
                </div>

                {/* Destination Location (conditional) */}
                {shipmentType === 'depot-to-depot' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">📍 Destination Location</label>
                    <select
                      {...register('destinationLocationId')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                      defaultValue=""
                    >
                      <option value="">Select a location...</option>
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
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {String(formState.errors.destinationLocationId.message)}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150"
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
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                      submitting || Object.keys(formState.errors).length > 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:from-green-700 hover:to-green-800 active:scale-95'
                    }`}
                    title={Object.keys(formState.errors).length > 0 ? 'Please fix validation errors' : ''}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {submitting ? 'Creating...' : Object.keys(formState.errors).length > 0 ? '❌ Fix Errors' : 'Create Shipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
