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
    // adapt types to API DTO
    const payload: RegisterDriverDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      licenseNumber: data.licenseNumber,
      phone: data.phone ?? undefined,
    };
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
      <h2 className="text-lg font-semibold mb-4 text-slate-900">New Driver</h2>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">First name</span>
        <input {...register('firstName')} autoComplete="given-name" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.firstName && <p className="text-sm text-red-600 mt-1">{String(formState.errors.firstName.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Last name</span>
        <input {...register('lastName')} autoComplete="family-name" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.lastName && <p className="text-sm text-red-600 mt-1">{String(formState.errors.lastName.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Email</span>
        <input {...register('email')} autoComplete="email" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.email && <p className="text-sm text-red-600 mt-1">{String(formState.errors.email.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Password</span>
        <input type="password" {...register('password')} autoComplete="new-password" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.password && <p className="text-sm text-red-600 mt-1">{String(formState.errors.password.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">License number</span>
        <input {...register('licenseNumber')} autoComplete="off" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
        {formState.errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{String(formState.errors.licenseNumber.message)}</p>}
      </label>

      <label className="block mb-2">
        <span className="text-sm text-gray-700">Phone</span>
        <input {...register('phone')} autoComplete="tel" className="mt-1 block w-full border rounded px-3 py-2 bg-white text-slate-900" />
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
