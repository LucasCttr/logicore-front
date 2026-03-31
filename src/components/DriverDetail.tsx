"use client";

import React, { useState } from 'react';
import { useDriver, useUpdateDriverStatus } from '../hooks/useDriver';

type Props = { id: string };

export default function DriverDetail({ id }: Props) {
  const { data, isLoading, error } = useDriver(id);
  const update = useUpdateDriverStatus();
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  if (isLoading) return <div>Loading driver...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  const driver = data;
  if (!driver) return <div>Driver not found.</div>;

  const handleUpdate = async () => {
    // determine target active state
    const target = typeof isActive === 'boolean' ? isActive : !!driver.isActive;
    setSaving(true);
    setUpdateError(null);
    try {
      await update.mutateAsync({ id: driver.id, payload: { isActive: target } });
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
      <div className="mb-2"><strong>Active:</strong> {driver.isActive ? 'Yes' : 'No'}</div>

      <div className="mt-4">
        <label className="block mb-2">Active</label>
        <select value={String(isActive ?? driver.isActive ?? false)} onChange={(e) => setIsActive(e.target.value === 'true')} className="border px-3 py-2 mr-2">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={handleUpdate} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
        {updateError && <div className="text-red-600 mt-2">{updateError}</div>}
      </div>
    </div>
  );
}
