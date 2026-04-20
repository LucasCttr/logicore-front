"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackage, useUpdatePackage, usePackageHistory } from '../hooks/usePackages';
import { editPackageSchema, type EditPackageSchema } from '../schemas/editPackage';
import { ShipmentType } from '../types/packages';
import { getLocations } from '../api/locations';
import type LocationDto from '../types/locations';

type Props = { id: string };

const getStatusLabel = (status: any) => {
  if (status === null || status === undefined) return '-';
  const asNumber = typeof status === 'number' ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return 'Pending';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      case 3:
        return 'Canceled';
      case 4:
        return 'At Depot';
      case 5:
        return 'Delivered to Center';
      case 6:
        return 'Returned';
      case 7:
        return 'Collected';
      case 8:
        return 'Last-Mile';
      default:
        return String(status);
    }
  }
  return String(status);
};

const getStatusBadgeClass = (status: any) => {
  if (status === null || status === undefined) return 'bg-gray-100 text-gray-800';
  const asNumber = typeof status === 'number' ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-orange-100 text-orange-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-purple-100 text-purple-800';
      case 5:
        return 'bg-indigo-100 text-indigo-800';
      case 6:
        return 'bg-red-100 text-red-800';
      case 7:
        return 'bg-cyan-100 text-cyan-800';
      case 8:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  return 'bg-gray-100 text-gray-800';
};

export default function PackageDetail({ id }: Props) {
  const { data, isLoading, error } = usePackage(id);
  const { data: history } = usePackageHistory(id);
  const updatePackage = useUpdatePackage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Load locations to map destination names
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locs = await getLocations();
        setLocations(locs);
      } catch (err) {
        console.error('Failed to load locations:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Helper to get location name by ID (order-based index)
  const getLocationName = (locationId: number | null) => {
    if (!locationId || !locations.length) return null;
    // Locations are typically indexed starting from 1
    const sorted = [...locations]
      .filter(loc => loc.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    if (locationId > 0 && locationId <= sorted.length) {
      return sorted[locationId - 1]?.name;
    }
    return null;
  };

  const { register, handleSubmit, formState, reset } = useForm<EditPackageSchema>({
    resolver: zodResolver(editPackageSchema) as any,
    values: data ? {
      description: data.description || '',
      internalCode: (data as any).internalCode || '',
      weight: data.weight || 0,
      recipientName: (data as any).recipient?.name || '',
      recipientAddress: (data as any).recipient?.address || '',
      recipientPhone: (data as any).recipient?.phone || '',
      recipientFloorApartment: (data as any).recipient?.floorApartment || '',
      recipientCity: (data as any).recipient?.city || '',
      recipientProvince: (data as any).recipient?.province || '',
      recipientPostalCode: (data as any).recipient?.postalCode || '',
      recipientDni: (data as any).recipient?.dni || '',
      lengthCm: (data as any).dimensions?.lengthCm || 0,
      widthCm: (data as any).dimensions?.widthCm || 0,
      heightCm: (data as any).dimensions?.heightCm || 0,
    } : undefined,
  });

  if (isLoading) return <div className="p-4">Loading package...</div>;
  if (error) return <div className="p-4 text-red-600">{error.message}</div>;

  const pkg = data;
  if (!pkg) return <div className="p-4">Package not found.</div>;

  const handleEditCancel = () => {
    setIsEditing(false);
    reset();
  };

  const onEditSubmit = async (formData: EditPackageSchema) => {
    try {
      await updatePackage.mutateAsync({
        id: pkg.id,
        payload: formData,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating package:', err);
    }
  };

  const statusLabel = getStatusLabel(pkg.status);
  const statusBadgeClass = getStatusBadgeClass(pkg.status);

  return (
    <div className="mx-auto p-6 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-light text-gray-900">Package {pkg.trackingNumber || 'N/A'}</h1>
        <div className="flex items-center gap-2">
          <Link 
            href="/packages"
            className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
          >
            ← Back
          </Link>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
            disabled={isEditing}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <form onSubmit={handleSubmit(onEditSubmit)} className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Package Information</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <input
                {...register('description')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.description.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Internal Code</span>
              <input
                {...register('internalCode')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.internalCode && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.internalCode.message)}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Weight (kg)</span>
              <input
                {...register('weight')}
                type="number"
                step="0.1"
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.weight && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.weight.message)}</p>
              )}
            </label>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-900">Recipient Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                {...register('recipientName')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientName && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientName.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">DNI</span>
              <input
                {...register('recipientDni')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientDni && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientDni.message)}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <input
                {...register('recipientPhone')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientPhone && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientPhone.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Address</span>
              <input
                {...register('recipientAddress')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientAddress && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientAddress.message)}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Floor/Apartment</span>
              <input
                {...register('recipientFloorApartment')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientFloorApartment && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientFloorApartment.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">City</span>
              <input
                {...register('recipientCity')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientCity && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientCity.message)}</p>
              )}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Province</span>
              <input
                {...register('recipientProvince')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientProvince && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientProvince.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Postal Code</span>
              <input
                {...register('recipientPostalCode')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.recipientPostalCode && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.recipientPostalCode.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700"></span>
            </label>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-4 text-gray-900">Dimensions (cm)</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Length</span>
              <input
                {...register('lengthCm')}
                type="number"
                step="0.1"
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.lengthCm && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.lengthCm.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Width</span>
              <input
                {...register('widthCm')}
                type="number"
                step="0.1"
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.widthCm && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.widthCm.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Height</span>
              <input
                {...register('heightCm')}
                type="number"
                step="0.1"
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.heightCm && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.heightCm.message)}</p>
              )}
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updatePackage.isPending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              {updatePackage.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={updatePackage.isPending}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded"
            >
              Cancel
            </button>
          </div>
          {updatePackage.isError && (
            <p className="text-red-600 mt-2">{updatePackage.error?.message ?? 'Error updating package'}</p>
          )}
        </form>
      ) : null}

      {/* View Mode - Two Column Layout */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        {/* Left Column - Package Details */}
        <div className="col-span-3 space-y-6">
          {/* Package Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Package Information</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-700 font-medium">Tracking Number</p>
                <p className="text-lg text-gray-900">{pkg.trackingNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Description</p>
                <p className="text-lg text-gray-900">{pkg.description || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Weight</p>
                <p className="text-lg text-gray-900">{pkg.weight ? `${pkg.weight} kg` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Internal Code</p>
                <p className="text-lg text-gray-900">{(pkg as any).internalCode || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Origin</p>
                <p className="text-lg text-gray-900">{pkg.originAddress || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Destination</p>
                <p className="text-lg text-gray-900">{pkg.destinationAddress || '-'}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2 text-gray-900">Status</h3>
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
              </div>
              {(pkg as any).currentLocationId && (
                <div className="">
                  <p className="font-semibold mb-2 text-gray-900">Current Location</p>
                  {(() => {
                    const sorted = [...locations]
                      .filter(loc => loc.createdAt)
                      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
                    const location = (pkg as any).currentLocationId <= sorted.length 
                      ? sorted[(pkg as any).currentLocationId - 1]
                      : null;
                    return location ? (
                      <>
                        <p className="font-semibold text-gray-700">{location.name}</p>
                        <p className="text-sm text-gray-700">{location.addressLine1}{location.addressLine2 ? `, ${location.addressLine2}` : ''}</p>
                        <p className="text-sm text-gray-700">{location.city}, {location.state || 'N/A'} {location.postalCode}</p>
                      </>
                    ) : (
                      <p className="font-bold text-gray-900 text-lg">Depot #{(pkg as any).currentLocationId}</p>
                    );
                  })()}
                </div>
              )}

              {/* Current Shipment Info */}
              {(pkg as any).currentShipment && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Shipment</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Shipment ID</p>
                      <p className="text-gray-900 font-mono text-sm">{(pkg as any).currentShipment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Shipment Type</p>
                      <p className="text-gray-900">
                        {(pkg as any).currentShipment.type === 0 ? 'Pickup' :
                         (pkg as any).currentShipment.type === 1 ? 'Transfer' :
                         (pkg as any).currentShipment.type === 2 ? 'Last-Mile' : 'Unknown'}
                      </p>
                    </div>
                    {(pkg as any).currentShipment.destinationLocationId && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Destination Depot</p>
                        <p className="text-gray-900">
                          {getLocationName((pkg as any).currentShipment.destinationLocationId) || 
                           `Depot #${(pkg as any).currentShipment.destinationLocationId}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Recipient Information */}
            {(pkg as any).recipient && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Recipient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Name</p>
                  <p className="text-gray-900">{(pkg as any).recipient.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">DNI</p>
                  <p className="text-gray-900">{(pkg as any).recipient.dni || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Phone</p>
                  <p className="text-gray-900">{(pkg as any).recipient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Address</p>
                  <p className="text-gray-900">{(pkg as any).recipient.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Floor/Apartment</p>
                  <p className="text-gray-900">{(pkg as any).recipient.floorApartment || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">City</p>
                  <p className="text-gray-900">{(pkg as any).recipient.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Province</p>
                  <p className="text-gray-900">{(pkg as any).recipient.province || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Postal Code</p>
                  <p className="text-gray-900">{(pkg as any).recipient.postalCode || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dimensions */}
          {(pkg as any).dimensions && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Dimensions</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Length (cm)</p>
                  <p className="text-gray-900">{(pkg as any).dimensions.lengthCm || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Width (cm)</p>
                  <p className="text-gray-900">{(pkg as any).dimensions.widthCm || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Height (cm)</p>
                  <p className="text-gray-900">{(pkg as any).dimensions.heightCm || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - History Timeline */}
        <div className="col-span-2">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 sticky top-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold text-lg text-gray-900">History</h3>
              {history && (
                <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {history.length} Events
                </span>
              )}
            </div>
            {(!history || history.length === 0) ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Sin historial disponible</p>
              </div>
            ) : (
              <div className="space-y-0">
                {history.map((h: any, idx: number) => {
                  const statusColors: Record<string, { bg: string; border: string; icon: string; label: string }> = {
                    'Pending': { bg: 'bg-yellow-50', border: 'border-yellow-400', icon: '', label: 'Pendiente' },
                    'InTransit': { bg: 'bg-orange-50', border: 'border-orange-400', icon: '', label: 'En Tránsito' },
                    'Delivered': { bg: 'bg-green-50', border: 'border-green-400', icon: '✅', label: 'Entregado' },
                    'AtDepot': { bg: 'bg-blue-50', border: 'border-blue-400', icon: '', label: 'En Depósito' },
                    'Canceled': { bg: 'bg-red-50', border: 'border-red-400', icon: '❌', label: 'Cancelado' },
                    'DeliveredToCenter': { bg: 'bg-indigo-50', border: 'border-indigo-400', icon: '', label: 'Centro' },
                    'Returned': { bg: 'bg-pink-50', border: 'border-pink-400', icon: '↩️', label: 'Devuelto' },
                    'Created': { bg: 'bg-slate-50', border: 'border-slate-400', icon: '💿', label: 'Creado' },
                  };

                  const toStatusInfo = statusColors[h.toStatus] || statusColors['Pending'];
                  const isLast = idx === history.length - 1;

                  return (
                    <div key={idx} className="relative">
                      {/* Timeline line */}
                      {!isLast && (
                        <div className="absolute left-6 top-16 w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-200"></div>
                      )}

                      {/* Timeline item */}
                      <div className={`${toStatusInfo.bg} ${toStatusInfo.border} border-l-4 rounded-r-lg p-4 mb-4 transition-all hover:shadow-md`}>
                        {/* Header: Status transition */}
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0 mt-0.5">{toStatusInfo.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">
                                {h.fromStatus}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="font-bold text-gray-900 text-sm">
                                {h.toStatus}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                               {new Date(h.occurredAt).toLocaleString('es-ES', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3 ml-11 space-y-2 text-xs">
                          {h.firstName && h.lastName && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">👤</span>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {h.firstName} {h.lastName}
                                </div>
                                {h.userName && (
                                  <div className="text-xs text-gray-500">
                                    {h.userName}
                                  </div>
                                )}
                              </div>
                              {h.userRoles && (
                                <div className="flex gap-1">
                                  {h.userRoles.split(', ').map((role: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                                        role === 'Admin'
                                          ? 'bg-red-500'
                                          : role === 'Driver'
                                          ? 'bg-blue-500'
                                          : 'bg-gray-500'
                                      }`}
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {h.locationId && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>📍</span>
                              <span>Depósito #{h.locationId}</span>
                            </div>
                          )}
                          {h.shipmentId && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>🚛</span>
                              <span className="font-mono bg-white bg-opacity-60 px-2 py-0.5 rounded">
                                {h.shipmentId.substring(0, 12)}...
                              </span>
                            </div>
                          )}
                          {h.notes && (
                            <div className="flex gap-2 text-gray-700 bg-white bg-opacity-70 p-2 rounded mt-2">
                              <span className="italic">{h.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
