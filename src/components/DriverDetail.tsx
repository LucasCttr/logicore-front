"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDriver, useUpdateDriver, useUpdateDriverStatus } from '../hooks/useDriver';
import { editDriverSchema, type EditDriverSchema } from '../schemas/driver';

type Props = { id: string };

export default function DriverDetail({ id }: Props) {
  const { data, isLoading, error } = useDriver(id);
  const updateDriver = useUpdateDriver();
  const updateStatus = useUpdateDriverStatus();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const { register, handleSubmit, formState, reset } = useForm<EditDriverSchema>({
    resolver: zodResolver(editDriverSchema),
    values: data ? {
      firstName: data.name?.split(' ')[0] || '',
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      email: data.email || '',
      licenseNumber: data.licenseNumber || '',
      phone: data.phone || '',
    } : undefined,
  });

  if (isLoading) return <div className="p-4">Loading driver...</div>;
  if (error) return <div className="p-4 text-red-600">{error.message}</div>;

  const driver = data;
  if (!driver) return <div className="p-4">Driver not found.</div>;

  const handleEditCancel = () => {
    setIsEditing(false);
    reset();
  };

  const onEditSubmit = async (formData: EditDriverSchema) => {
    try {
      await updateDriver.mutateAsync({
        id: driver.id,
        payload: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          phone: formData.phone,
        },
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating driver:', err);
    }
  };

  const handleToggleActive = async () => {
    const target = typeof isActive === 'boolean' ? isActive : !!driver.isActive;
    setStatusSaving(true);
    setToggleError(null);
    try {
      await updateStatus.mutateAsync({
        id: driver.id,
        payload: { isActive: !target },
      });
      setIsActive(undefined);
    } catch (err: any) {
      setToggleError(err?.message ?? 'Error');
    } finally {
      setStatusSaving(false);
    }
  };

  const driverName = driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Sin nombre';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link 
            href="/drivers"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{driverName}</h1>
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
          <h2 className="text-xl font-semibold mb-4">Edit Driver Information</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">First Name</span>
              <input
                {...register('firstName')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.firstName.message)}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Last Name</span>
              <input
                {...register('lastName')}
                className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
              />
              {formState.errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{String(formState.errors.lastName.message)}</p>
              )}
            </label>
          </div>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
            />
            {formState.errors.email && (
              <p className="text-sm text-red-600 mt-1">{String(formState.errors.email.message)}</p>
            )}
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">License Number</span>
            <input
              {...register('licenseNumber')}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
            />
            {formState.errors.licenseNumber && (
              <p className="text-sm text-red-600 mt-1">{String(formState.errors.licenseNumber.message)}</p>
            )}
          </label>

          <label className="block mb-6">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input
              {...register('phone')}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-gray-900"
            />
            {formState.errors.phone && (
              <p className="text-sm text-red-600 mt-1">{String(formState.errors.phone.message)}</p>
            )}
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updateDriver.isPending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
            >
              {updateDriver.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={updateDriver.isPending}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded"
            >
              Cancel
            </button>
          </div>
          {updateDriver.isError && (
            <p className="text-red-600 mt-2">{updateDriver.error?.message ?? 'Error updating driver'}</p>
          )}
        </form>
      ) : null}

      {/* View Mode */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Driver Information</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-700 font-medium">Name</p>
            <p className="text-lg text-gray-900">{driverName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Email</p>
            <p className="text-lg text-gray-900">{driver.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Phone</p>
            <p className="text-lg text-gray-900">{driver.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">License Number</p>
            <p className="text-lg text-gray-900">{driver.licenseNumber || '-'}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3 text-gray-900">Status</h3>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isActive ?? driver.isActive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {isActive ?? driver.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleToggleActive}
              disabled={statusSaving}
              className={`px-4 py-2 rounded text-white text-sm transition-colors ${
                (isActive ?? driver.isActive)
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {statusSaving ? 'Processing...' : (isActive ?? driver.isActive) ? 'Deactivate' : 'Activate'}
            </button>
          </div>
          {toggleError && <p className="text-red-600 text-sm mt-2">{toggleError}</p>}
        </div>
      </div>
    </div>
  );
}
