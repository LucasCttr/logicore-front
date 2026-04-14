"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createLocationSchema, { CreateLocationSchema } from '../schemas/location';
import { useCreateLocation } from '../hooks/useLocations';
import type { CreateLocationDto } from '../types/locations';

interface LocationFormProps {
  onSuccess?: () => void;
}

export default function LocationForm({ onSuccess }: LocationFormProps) {
  const mutation = useCreateLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState, reset } = useForm<CreateLocationSchema>({
    resolver: zodResolver(createLocationSchema),
  });

  const onSubmit = async (data: CreateLocationSchema) => {
    const payload: CreateLocationDto = {
      name: data.name,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
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
      reset();
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Error creating location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4 bg-white rounded border border-gray-300 shadow mt-4">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">Add New Distribution Center</h2>

      {submitError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Location Name *</span>
            <input
              {...register('name')}
              placeholder="e.g., Distribution Center A"
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
            />
            {formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">{String(formState.errors.name.message)}</p>
            )}
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Address Line 1 *</span>
            <input
              {...register('addressLine1')}
              placeholder="e.g., 123 Main Street"
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
            />
            {formState.errors.addressLine1 && (
              <p className="text-sm text-red-600 mt-1">{String(formState.errors.addressLine1.message)}</p>
            )}
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Address Line 2</span>
            <input
              {...register('addressLine2')}
              placeholder="e.g., Suite 200 (optional)"
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
            />
          </label>
        </div>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">City *</span>
          <input
            {...register('city')}
            placeholder="e.g., Buenos Aires"
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
          {formState.errors.city && (
            <p className="text-sm text-red-600 mt-1">{String(formState.errors.city.message)}</p>
          )}
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">State/Province</span>
          <input
            {...register('state')}
            placeholder="e.g., Buenos Aires"
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Postal Code *</span>
          <input
            {...register('postalCode')}
            placeholder="e.g., 1425"
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
          {formState.errors.postalCode && (
            <p className="text-sm text-red-600 mt-1">{String(formState.errors.postalCode.message)}</p>
          )}
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Country *</span>
          <input
            {...register('country')}
            placeholder="e.g., Argentina"
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
          {formState.errors.country && (
            <p className="text-sm text-red-600 mt-1">{String(formState.errors.country.message)}</p>
          )}
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Location'}
        </button>
      </div>
    </form>
  );
}
