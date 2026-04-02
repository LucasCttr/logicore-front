"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
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

  const resolver = zodResolver(createPackageSchema) as Resolver<CreatePackageSchema>;

  const { register, handleSubmit, formState, setValue } = useForm<CreatePackageSchema>({
    resolver,
  });

  // Autocomplete state for origin and destination
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const originTimer = useRef<number | null>(null);
  const destTimer = useRef<number | null>(null);
  const minPrefix = 3;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5074';

  const onSubmit = async (data: CreatePackageSchema) => {
    const payload: CreatePackageDto = {
      trackingNumber: data.trackingNumber,
      description: data.description ?? undefined,
      weight: data.weight ?? undefined,
      origin: data.origin ?? undefined,
      destination: data.destination ?? undefined,
      recipientName: data.recipientName ?? undefined,
      recipientAddress: data.recipientAddress ?? undefined,
      recipientPhone: data.recipientPhone ?? undefined,
      recipientFloorApartment: data.recipientFloorApartment ?? undefined,
      recipientCity: data.recipientCity ?? undefined,
      recipientProvince: data.recipientProvince ?? undefined,
      recipientPostalCode: data.recipientPostalCode ?? undefined,
      recipientDni: data.recipientDni ?? undefined,
      lengthCm: data.lengthCm ?? undefined,
      widthCm: data.widthCm ?? undefined,
      heightCm: data.heightCm ?? undefined,
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

      <fieldset className="border-t pt-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">Recipient (optional)</legend>
        <label className="block mb-2">
          <span className="text-sm text-gray-700">Name</span>
          <input {...register('recipientName')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        </label>
        <label className="block mb-2">
          <span className="text-sm text-gray-700">Address</span>
          <input {...register('recipientAddress')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Phone</span>
            <input {...register('recipientPhone')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
          <label className="block mb-2">
            <span className="text-sm text-gray-700">DNI</span>
            <input {...register('recipientDni')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">City</span>
            <input {...register('recipientCity')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Province</span>
            <input {...register('recipientProvince')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Postal code</span>
            <input {...register('recipientPostalCode')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
        </div>
        <label className="block mb-2">
          <span className="text-sm text-gray-700">Floor / Apt</span>
          <input {...register('recipientFloorApartment')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        </label>
      </fieldset>

      <fieldset className="border-t pt-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">Dimensions (cm, optional)</legend>
        <div className="grid grid-cols-3 gap-4">
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Length</span>
            <input type="number" step="any" {...register('lengthCm')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Width</span>
            <input type="number" step="any" {...register('widthCm')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
          <label className="block mb-2">
            <span className="text-sm text-gray-700">Height</span>
            <input type="number" step="any" {...register('heightCm')} className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
          </label>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <label className="block mb-2">
          <span className="text-sm text-gray-700">Origin</span>
          <div className="relative">
            <input
              list="locations-origin"
              {...register('origin')}
              onInput={(e: any) => {
                const val = e.target.value;
                setValue('origin', val as any);
                if (originTimer.current) window.clearTimeout(originTimer.current);
                if (!val || val.trim().length < minPrefix) {
                  setOriginSuggestions([]);
                  return;
                }
                originTimer.current = window.setTimeout(async () => {
                  try {
                    const res = await fetch(`${apiBase}/api/addresses/autocomplete?q=${encodeURIComponent(val)}`);
                    if (res.ok) setOriginSuggestions(await res.json());
                  } catch (_) { /* ignore */ }
                }, 250);
              }}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
            />

            {originSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border rounded mt-1 max-h-40 overflow-auto z-10">
                {originSuggestions.map((s) => (
                  <li
                    key={s}
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                    onClick={async () => {
                      setValue('origin', s as any, { shouldValidate: true, shouldDirty: true });
                      setOriginSuggestions([]);
                      // record selection
                      try { await fetch(`${apiBase}/api/addresses/selected`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: s }) }); } catch (_) {}
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <datalist id="locations-origin">
            {locations?.map((l: any) => (
              <option key={l.id} value={l.name} />
            ))}
          </datalist>
        </label>

        <label className="block mb-2">
          <span className="text-sm text-gray-700">Destination</span>
          <div className="relative">
            <input
              list="locations-destination"
              {...register('destination')}
              onInput={(e: any) => {
                const val = e.target.value;
                setValue('destination', val as any);
                if (destTimer.current) window.clearTimeout(destTimer.current);
                if (!val || val.trim().length < minPrefix) {
                  setDestinationSuggestions([]);
                  return;
                }
                destTimer.current = window.setTimeout(async () => {
                  try {
                    const res = await fetch(`${apiBase}/api/addresses/autocomplete?q=${encodeURIComponent(val)}`);
                    if (res.ok) setDestinationSuggestions(await res.json());
                  } catch (_) { /* ignore */ }
                }, 250);
              }}
              className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900"
            />

            {destinationSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white border rounded mt-1 max-h-40 overflow-auto z-10">
                {destinationSuggestions.map((s) => (
                  <li
                    key={s}
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                    onClick={async () => {
                      setValue('destination', s as any, { shouldValidate: true, shouldDirty: true });
                      setDestinationSuggestions([]);
                      try { await fetch(`${apiBase}/api/addresses/selected`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: s }) }); } catch (_) {}
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
