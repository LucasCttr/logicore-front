"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import createPackageSchema, { CreatePackageSchema } from '../schemas/package';
import { useCreatePackage } from '../hooks/usePackages';
import type { CreatePackageDto } from '../types/packages';
import { useRouter } from 'next/navigation';
import { useLocations } from '../hooks/useLocations';

export default function PackageForm() {
  const router = useRouter();
  const mutation = useCreatePackage();
  const { data: locations } = useLocations();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState, setValue } = useForm<CreatePackageSchema>({
    resolver: zodResolver(createPackageSchema),
  });

  const onSubmit = async (data: CreatePackageSchema) => {
    const payload: CreatePackageDto = {
      trackingNumber: data.trackingNumber,
      description: data.description ?? undefined,
      weight: data.weight ?? undefined,
      origin: data.origin ?? undefined,
      destination: data.destination ?? undefined,
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
      router.push('/packages');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-4 bg-white rounded border border-gray-300 shadow">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">New Package</h2>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Tracking number</span>
        <input {...register('trackingNumber')} autoComplete="off" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.trackingNumber && <p className="text-sm text-red-600 mt-1">{String(formState.errors.trackingNumber.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Description</span>
        <input {...register('description')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.description && <p className="text-sm text-red-600 mt-1">{String(formState.errors.description.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Weight (kg)</span>
        <input type="number" step="any" {...register('weight')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.weight && <p className="text-sm text-red-600 mt-1">{String(formState.errors.weight.message)}</p>}
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block mb-2">
          <span className="text-sm text-gray-700">Origin</span>
          <input
            list="locations-origin"
            {...register('origin')}
            onInput={(e: any) => {
              const val = e.target.value;
              // always store the string; suggestions are just hints
              setValue('origin', val as any);
            }}
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
          <datalist id="locations-origin">
            {locations?.map((l: any) => (
              <option key={l.id} value={l.name} />
            ))}
          </datalist>
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Destination</span>
          <input
            list="locations-destination"
            {...register('destination')}
            onInput={(e: any) => {
              const val = e.target.value;
              setValue('destination', val as any);
            }}
            className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
          />
          <datalist id="locations-destination">
            {locations?.map((l: any) => (
              <option key={l.id} value={l.name} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {submitting ? 'Saving...' : 'Create'}
        </button>
        {submitError && <div className="text-sm text-red-600">{submitError}</div>}
      </div>
    </form>
  );
}
