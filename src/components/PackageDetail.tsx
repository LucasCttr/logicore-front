"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePackage, useUpdatePackage, usePackageHistory, useDeliverPackage, useCancelPackage } from '../hooks/usePackages';
import { editPackageSchema, type EditPackageSchema } from '../schemas/editPackage';

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
        return 'Delivered (Center)';
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
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      case 5:
        return 'bg-emerald-100 text-emerald-800';
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
  const deliver = useDeliverPackage();
  const cancel = useCancelPackage();

  const [isEditing, setIsEditing] = useState(false);
  const [savingDeliver, setSavingDeliver] = React.useState(false);
  const [savingCancel, setSavingCancel] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link 
            href="/packages"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Package {pkg.trackingNumber || 'N/A'}</h1>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
          disabled={isEditing}
        >
          ✏️ Edit
        </button>
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

      {/* View Mode */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        <div className="border-t pt-6 mb-6">
          <h3 className="font-semibold mb-4 text-gray-900">Status</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>

        {(pkg as any).recipient && (
          <div className="border-t pt-6 mb-6">
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

        {(pkg as any).dimensions && (
          <div className="border-t pt-6 mb-6">
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

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold mb-4 text-gray-900">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setActionError(null);
              setSavingDeliver(true);
              try {
                await deliver.mutateAsync(pkg.id);
              } catch (err: any) {
                setActionError(err?.message ?? 'Error');
              } finally {
                setSavingDeliver(false);
              }
            }}
            disabled={savingDeliver}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
          >
            {savingDeliver ? 'Working...' : '✓ Deliver'}
          </button>
          <button
            onClick={async () => {
              setActionError(null);
              setSavingCancel(true);
              try {
                await cancel.mutateAsync(pkg.id);
              } catch (err: any) {
                setActionError(err?.message ?? 'Error');
              } finally {
                setSavingCancel(false);
              }
            }}
            disabled={savingCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
          >
            {savingCancel ? 'Working...' : '✗ Cancel'}
          </button>
        </div>
        {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
      </div>

      {/* History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 text-gray-900">History</h3>
        {(!history || history.length === 0) ? (
          <div className="text-gray-600">No history available.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((h: any, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 border-b pb-2 last:border-b-0">
                <span className="font-medium">{h.at}</span> — {h.status ?? h.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
