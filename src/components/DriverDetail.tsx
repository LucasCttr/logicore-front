"use client";

import React, { useState } from 'react';
import { useDriver, useUpdateDriverStatus } from '../hooks/useDriver';

type Props = { id: string };

export default function DriverDetail({ id }: Props) {
  const { data, isLoading, error } = useDriver(id);
  const update = useUpdateDriverStatus();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (isLoading) return <div>Loading driver...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  const driver = data;
  if (!driver) return <div>Driver not found.</div>;

  const handleUpdate = async () => {
    if (!status) return;
    setSaving(true);
    setUpdateError(null);
    try {
      await update.mutateAsync({ id: driver.id, payload: { status } });
    } catch (err: any) {
      setUpdateError(err?.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-xl font-semibold mb-3">Driver</h2>
      <div className="mb-2"><strong>Name:</strong> {driver.name}</div>
      <div className="mb-2"><strong>Phone:</strong> {driver.phone ?? '-'}</div>
      <div className="mb-2"><strong>Status:</strong> {driver.status ?? '-'}</div>

      <div className="mt-4">
        <label className="block mb-2">Update status</label>
        <input value={status ?? ''} onChange={(e) => setStatus(e.target.value)} className="border px-3 py-2 mr-2" />
        <button onClick={handleUpdate} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
        {updateError && <div className="text-red-600 mt-2">{updateError}</div>}
      </div>
    </div>
  );
}
