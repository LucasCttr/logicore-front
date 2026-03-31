"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import registerDriverSchema, { RegisterDriverSchema } from '../schemas/driver';
import { useRegisterDriver } from '../hooks/useDriver';
import type { RegisterDriverDto } from '../types/drivers';
import { useRouter } from 'next/navigation';

export default function DriverForm() {
  const router = useRouter();
  const mutation = useRegisterDriver();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<RegisterDriverSchema>({
    resolver: zodResolver(registerDriverSchema),
  });

  const onSubmit = async (data: RegisterDriverSchema) => {
    // adapt types if necessary
    const payload: RegisterDriverDto = { name: data.name, phone: data.phone ?? undefined };
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (mutation.mutateAsync) {
        await mutation.mutateAsync(payload);
      } else {
        // fallback to mutate with Promise wrapper
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
      router.push('/drivers');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">New Driver</h2>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Name</span>
        <input {...register('name')} className="mt-1 block w-full border rounded px-3 py-2" />
        {formState.errors.name && <p className="text-sm text-red-600 mt-1">{String(formState.errors.name.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Phone</span>
        <input {...register('phone')} className="mt-1 block w-full border rounded px-3 py-2" />
        {formState.errors.phone && <p className="text-sm text-red-600 mt-1">{String(formState.errors.phone.message)}</p>}
      </label>

      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {submitting ? 'Saving...' : 'Create'}
        </button>
        {submitError && <div className="text-sm text-red-600">{submitError}</div>}
      </div>
    </form>
  );
}
