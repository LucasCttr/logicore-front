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
import { useVehicles } from '../hooks/useVehicles';
import type { CreateShipmentDto, ShipmentType } from '../types/shipments';
import type { LocationDto } from '../types/locations';
import { useRouter } from 'next/navigation';

type FormStep = 'setup' | 'packages' | 'confirm';

export default function ShipmentForm() {
  const router = useRouter();
  const mutation = useCreateShipment();
  const { data: packagesData } = usePackages(1, 100);
  const { data: driversData } = useDrivers();
  const { data: vehiclesData } = useVehicles();
  const { data: locationsData } = useLocations();

  const [formStep, setFormStep] = useState<FormStep>('setup');
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Step 1: Shipment Setup
  const [shipmentType, setShipmentType] = useState<ShipmentType | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedOriginId, setSelectedOriginId] = useState<string>('');      // For Transfer only
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(''); // For Pickup/Transfer

  const resolver = zodResolver(createShipmentSchema) as Resolver<CreateShipmentSchema>;
  const { register, handleSubmit, formState, setValue } = useForm<CreateShipmentSchema>({
    resolver,
    mode: 'onBlur',
    defaultValues: {
      driverId: '',
      vehicleId: '',
      estimatedDelivery: '',
      originLocationId: '',
      destinationLocationId: '',
    },
  });

  // Get base data
  const allPackages = packagesData?.items ?? [];
  const drivers = driversData?.items ?? [];
  const vehicles = vehiclesData?.items ?? [];
  const locations = Array.isArray(locationsData) ? locationsData : [];

  // Helper: Get location index (1-based) from location GUID
  // Builds a consistent mapping by sorting locations by createdAt
  const buildLocationMap = (): Record<string, number> => {
    const sorted = [...locations]
      .filter(loc => loc.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    
    const map: Record<string, number> = {};
    sorted.forEach((loc, idx) => {
      map[loc.id] = idx + 1; // 1-based index
    });
    return map;
  };

  const locationMap = buildLocationMap();

  // Helper: Get location index from GUID
  const getLocationIndex = (locationId: string): number | null => {
    return locationMap[locationId] || null;
  };

  // Dynamic package filtering based on shipment type and location
  const getFilteredPackages = (): typeof allPackages => {
    if (shipmentType === null || shipmentType === undefined) return [];

    return allPackages.filter(p => {
      const status = Number(p.status);
      
      switch (shipmentType) {
        case 0: // Pickup - only Pending packages
          return status === 0;
        case 1: // Transfer - only AtDepot packages FROM the selected origin location
          if (status !== 4) return false; // Must be AtDepot
          
          // Filter by origin location if selected
          if (selectedOriginId) {
            const currentLocId = Number(p.currentLocationId ?? -1);
            const originLocIndex = getLocationIndex(selectedOriginId);
            return currentLocId === originLocIndex;
          }
          return true; // Show all AtDepot if no origin selected yet
          
        case 2: // LastMile - Pending or AtDepot
          return status === 0 || status === 4;
        default:
          return false;
      }
    });
  };

  const packages = getFilteredPackages();
  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  // Auto-assign vehicle when driver is selected
  useEffect(() => {
    if (selectedDriverId && selectedDriver?.assignedVehicleId) {
      setValue('vehicleId', selectedDriver.assignedVehicleId);
    }
  }, [selectedDriverId, selectedDriver, setValue]);

  // Validate step 1 (setup): type, driver, and conditional location requirements
  const canProceedToStep2 = (): boolean => {
    if (shipmentType === null || shipmentType === undefined) return false;
    if (!selectedDriverId) return false;
    // Pickup (0) requires destination location
    if (shipmentType === 0 && !selectedDestinationId) return false;
    // Transfer (1) requires BOTH origin and destination
    if (shipmentType === 1 && (!selectedOriginId || !selectedDestinationId)) return false;
    // LastMile (2) doesn't require any location
    return true;
  };

  // Handle proceeding to package selection
  const handleProceedToPackages = async () => {
    if (!canProceedToStep2()) {
      const msg = shipmentType === 0 ? 'Please select shipment type, driver, and destination depot' 
                : shipmentType === 1 ? 'Please select shipment type, driver, origin depot, and destination depot'
                : 'Please select shipment type and driver';
      setSubmitError(msg);
      return;
    }
    
    if (packages.length === 0) {
      const packageType = shipmentType === 0 ? 'Pending' : shipmentType === 1 ? 'AtDepot in selected origin' : 'available';
      setSubmitError(`No ${packageType} packages found for this shipment type`);
      return;
    }

    setSubmitError(null);
    setSelectedPackages(new Set());
    
    // Set form defaults for later submission
    setValue('driverId', selectedDriverId);
    if (selectedDriver?.assignedVehicleId) {
      setValue('vehicleId', selectedDriver.assignedVehicleId);
    }
    if (shipmentType === 0 && selectedDestinationId) {
      setValue('destinationLocationId', selectedDestinationId);
    }
    if (shipmentType === 1 && selectedOriginId) {
      setValue('originLocationId', selectedOriginId);
    }
    if (shipmentType === 1 && selectedDestinationId) {
      setValue('destinationLocationId', selectedDestinationId);
    }
    
    setFormStep('packages');
  };

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

  // Handle form submission for final confirmation
  const onSubmit = async (data: CreateShipmentSchema) => {
    try {
      if (selectedPackages.size === 0) {
        setSubmitError('Please select at least one package');
        return;
      }

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
        type: shipmentType!,
        originLocationId: shipmentType === 1 && data.originLocationId 
          ? getLocationIndex(data.originLocationId) 
          : null,
        destinationLocationId: (shipmentType === 0 || shipmentType === 1) && data.destinationLocationId 
          ? getLocationIndex(data.destinationLocationId) 
          : null,
      };

      setSubmitting(true);
      setSubmitError(null);
      
      if (mutation.mutateAsync) {
        await mutation.mutateAsync(payload);
      } else {
        await new Promise<void>((resolve, reject) => {
          mutation.mutate(payload, {
            onSuccess() {
              resolve();
            },
            onError(err: any) {
              reject(err);
            },
          });
        });
      }
      
      setSelectedPackages(new Set());
      setFormStep('setup');
      router.push('/shipments');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error creating shipment';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: number | string | null) => {
    const statusMap: Record<number, string> = {
      0: 'Pending',
      1: 'In Transit',
      2: 'Delivered',
      3: 'Canceled',
      4: 'At Depot',
      5: 'Delivered to Center',
      6: 'Returned',
      7: 'Collected',
      8: 'Last-Mile',
    };
    return statusMap[Number(status)] || 'Unknown';
  };

  const getStatusColor = (status: number | string | null) => {
    const colorMap: Record<number, string> = {
      0: 'bg-yellow-100 text-yellow-800',
      1: 'bg-orange-100 text-orange-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-red-100 text-red-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-indigo-100 text-indigo-800',
      6: 'bg-red-100 text-red-800',
      7: 'bg-cyan-100 text-cyan-800',
      8: 'bg-pink-100 text-pink-800',
    };
    return colorMap[Number(status)] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Create Shipment</h1>
            <div className="text-sm font-semibold text-slate-600">
              Step {formStep === 'setup' ? 1 : formStep === 'packages' ? 2 : 3} of 3
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full transition-colors ${formStep === 'setup' || formStep === 'packages' || formStep === 'confirm' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-colors ${formStep === 'packages' || formStep === 'confirm' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-colors ${formStep === 'confirm' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 animate-in fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Setup (Type, Driver, Destination) */}
        {formStep === 'setup' && (
          <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipment Details</h2>
            
            {/* Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-4">Shipment Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { type: 0, label: 'Pickup', desc: 'Collect packages from locations' },
                  { type: 2, label: 'Last-Mile', desc: 'Final delivery to customers' },
                  { type: 1, label: 'Depot-to-Depot', desc: 'Inter-depot transfer' },
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setShipmentType(type as ShipmentType)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      shipmentType === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{label}</p>
                    <p className="text-sm text-slate-600 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Driver *</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
              >
                <option value="">Select a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} {driver.assignedVehicleId ? '' : ''}
                  </option>
                ))}
              </select>
              {selectedDriver && (
                <p className="text-sm text-slate-600 mt-2">
                  Vehicle: {selectedDriver.assignedVehicleId ? vehicles.find(v => v.id === selectedDriver.assignedVehicleId)?.licensePlate || 'No plate' : 'No vehicle assigned'}
                </p>
              )}
            </div>

            {/* Location Selection for Pickup (destination only) */}
            {shipmentType === 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Destination Depot (where to bring collected items) *</label>
                <select
                  value={selectedDestinationId}
                  onChange={(e) => setSelectedDestinationId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                >
                  <option value="">Select destination depot...</option>
                  {locations.map((location: LocationDto) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Location Selection for Transfer (origin AND destination) */}
            {shipmentType === 1 && (
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">📤 Origin Depot (collect from) *</label>
                  <select
                    value={selectedOriginId}
                    onChange={(e) => setSelectedOriginId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                  >
                    <option value="">Select origin depot...</option>
                    {locations.map((location: LocationDto) => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">📥 Destination Depot (deliver to) *</label>
                  <select
                    value={selectedDestinationId}
                    onChange={(e) => setSelectedDestinationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                  >
                    <option value="">Select destination depot...</option>
                    {locations.map((location: LocationDto) => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* LastMile Info */}
            {shipmentType === 2 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <p className="text-sm font-semibold text-blue-900">ℹ️ Last-Mile Delivery</p>
                <p className="text-xs text-blue-700 mt-1">Each package will be delivered to its destination address. No depot selection needed.</p>
              </div>
            )}

            {/* Available Packages Info */}
            {shipmentType !== null && shipmentType !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
                <p className="text-sm text-slate-600">Available packages:</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{packages.length}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {shipmentType === 0 ? 'Pending packages' : shipmentType === 1 ? 'At Depot packages' : 'Pending or At Depot packages'}
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleProceedToPackages}
              disabled={!canProceedToStep2()}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                !canProceedToStep2()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg active:scale-95'
              }`}
            >
              <span>Next: Select Packages</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* STEP 2: Package Selection */}
        {formStep === 'packages' && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setFormStep('setup')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Packages Selection */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Select Packages</h2>
                    <p className="text-sm text-slate-600 mt-1">{selectedPackages.size} selected</p>
                    {shipmentType === 2 && (
                      <p className="text-xs text-blue-700 mt-2">ℹ️ Driver will visit each destination address and mark packages as delivered individually</p>
                    )}
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tracking</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Origin</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {packages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-slate-600 font-medium">No packages available</p>
                        </td>
                      </tr>
                    ) : (
                      packages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedPackages.has(pkg.id)}
                              onChange={() => togglePackage(pkg.id)}
                              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-900">{pkg.trackingNumber}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{pkg.originAddress}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{pkg.destinationAddress}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">{pkg.weight || 'N/A'}kg</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pkg.status ?? 0)}`}>
                              {getStatusLabel(pkg.status ?? 0)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold">
                    {selectedPackages.size}
                  </div>
                  <span className="text-slate-700">of {packages.length} packages selected</span>
                </div>
                <button
                  onClick={() => setFormStep('confirm')}
                  disabled={selectedPackages.size === 0}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    selectedPackages.size === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg active:scale-95'
                  }`}
                >
                  <span>Next: Confirm</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation & Delivery Date */}
        {formStep === 'confirm' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setFormStep('packages')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Confirm Details</h2>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {shipmentType === 0 ? 'Pickup' : shipmentType === 1 ? 'Depot Transfer' : 'Last-Mile'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Driver</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{selectedDriver?.name}</p>
                </div>
                {shipmentType === 0 && selectedDestinationId && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Destination Depot</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {locations.find(l => String(l.id) === selectedDestinationId)?.name}
                    </p>
                  </div>
                )}
                {shipmentType === 1 && (
                  <>
                    {selectedOriginId && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600">Origin Depot</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {locations.find(l => String(l.id) === selectedOriginId)?.name}
                        </p>
                      </div>
                    )}
                    {selectedDestinationId && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600">Destination Depot</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {locations.find(l => String(l.id) === selectedDestinationId)?.name}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {shipmentType === 2 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Destinations</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">Multiple Addresses</p>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Packages</p>
                  <p className="text-lg font-semibold text-blue-900 mt-1">{selectedPackages.size} selected</p>
                </div>
              </div>

              {/* Estimated Delivery Date */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Estimated Delivery Date *</label>
                <input
                  type="datetime-local"
                  {...register('estimatedDelivery')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-slate-900 bg-white transition-colors duration-150"
                />
                {formState.errors.estimatedDelivery && (
                  <p className="text-sm text-red-600 mt-1">⚠️ {String(formState.errors.estimatedDelivery.message)}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || Object.keys(formState.errors).length > 0}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  submitting || Object.keys(formState.errors).length > 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg active:scale-95'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {submitting ? 'Creating...' : 'Create Shipment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
