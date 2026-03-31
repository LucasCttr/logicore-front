"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUpdateDriverStatus } from '../hooks/useDriver';
import { useDrivers } from '../hooks/useDrivers';

export default function DriverList() {
  const { data, isLoading, isError, error, refetch } = useDrivers();
  const router = useRouter();
  const update = useUpdateDriverStatus();

  if (isLoading) return <div className="p-4">Loading drivers...</div>;
  if (isError) return (
    <div className="p-4">
      <div>Error: {error?.message}</div>
      <button onClick={() => refetch()} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );

  const handleToggleActive = async (id: string, current?: boolean) => {
    try {
      await update.mutateAsync({ id, payload: { isActive: !current } });
    } catch (e) {
      // ignore - UI will refresh from react-query
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Drivers</h2>
        <Link href="/drivers/new" className="px-3 py-2 bg-blue-600 text-white rounded">New Driver</Link>
      </div>

      {(!data || data.length === 0) ? (
        <div>Not drivers available.</div>
      ) : (
        <ul className="space-y-2">
          {data.map((d) => (
            <li key={d.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{d.name ?? d.fullName ?? 'Sin nombre'}</div>
                {d.phone && <div className="text-sm text-gray-500">{d.phone}</div>}
                {d.licenseNumber && <div className="text-sm text-gray-500">License: {d.licenseNumber}</div>}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{d.isActive ? 'Active' : 'Inactive'}</div>
                <button onClick={() => router.push(`/drivers/${d.id}`)} className="px-2 py-1 bg-gray-200 rounded">View</button>
                <button onClick={() => handleToggleActive(d.id, !!d.isActive)} className="px-2 py-1 bg-red-500 text-white rounded">{d.isActive ? 'Deactivate' : 'Activate'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
