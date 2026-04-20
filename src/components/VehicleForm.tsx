"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createVehicleSchema, { CreateVehicleSchema } from '../schemas/vehicle';
import type { CreateVehicleRequest } from '../api/vehicles';
import { useCreateVehicle } from '../hooks/useVehicles';
import { useRouter } from 'next/navigation';

export default function VehicleForm() {
  const router = useRouter();
  const mutation = useCreateVehicle();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<CreateVehicleSchema>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      plate: '',
      make: '',
      model: '',
      maxWeightCapacity: 5000,
      maxVolumeCapacity: 20,
    },
  });

  const onSubmit = async (data: CreateVehicleSchema) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload: CreateVehicleRequest = {
      plate: data.plate.trim(),
      maxWeightCapacity: data.maxWeightCapacity,
      maxVolumeCapacity: data.maxVolumeCapacity,
      make: data.make.trim() || undefined,
      model: data.model.trim() || undefined,
    };
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
      router.push('/vehicles');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Error creating vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-4 bg-white rounded border border-gray-300 shadow mt-4">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">New Vehicle</h2>

      <label className="block mb-2">
        <span className="text-sm text-gray-700 font-medium">License Plate</span>
        <input
          {...register('plate')}
          className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          placeholder="e.g., ABC-1234"
        />
        {formState.errors.plate && <p className="text-sm text-red-600 mt-1">{String(formState.errors.plate.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700 font-medium">Marca</span>
        <input
          {...register('make')}
          className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          placeholder="e.g., Mercedes-Benz"
        />
        {formState.errors.make && <p className="text-sm text-red-600 mt-1">{String(formState.errors.make.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700 font-medium">Modelo</span>
        <input
          {...register('model')}
          className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          placeholder="e.g., Sprinter"
        />
        {formState.errors.model && <p className="text-sm text-red-600 mt-1">{String(formState.errors.model.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700 font-medium">Maximum Weight Capacity (kg)</span>
        <input
          type="number"
          {...register('maxWeightCapacity', { valueAsNumber: true })}
          className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          placeholder="e.g., 5000"
        />
        {formState.errors.maxWeightCapacity && <p className="text-sm text-red-600 mt-1">{String(formState.errors.maxWeightCapacity.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700 font-medium">Maximum Volume Capacity (m³)</span>
        <input
          type="number"
          {...register('maxVolumeCapacity', { valueAsNumber: true })}
          className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          placeholder="e.g., 20"
        />
        {formState.errors.maxVolumeCapacity && <p className="text-sm text-red-600 mt-1">{String(formState.errors.maxVolumeCapacity.message)}</p>}
      </label>

      {submitError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{submitError}</div>}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
        >
          {submitting ? 'Creating...' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  );
}
