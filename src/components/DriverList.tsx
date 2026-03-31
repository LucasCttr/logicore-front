"use client";

import React from 'react';
import { useDrivers } from '../hooks/useDrivers';

export default function DriverList() {
  const { data, isLoading, isError, error, refetch } = useDrivers();

  if (isLoading) return <div className="p-4">Loading drivers...</div>;
  if (isError) return (
    <div className="p-4">
      <div>Error: {error?.message}</div>
      <button onClick={() => refetch()} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Retry</button>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Drivers</h2>
      {(!data || data.length === 0) ? (
        <div>Not drivers available.</div>
      ) : (
        <ul className="space-y-2">
          {data.map((d) => (
            <li key={d.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{d.name ?? d.fullName ?? 'Sin nombre'}</div>
                {d.phone && <div className="text-sm text-gray-500">{d.phone}</div>}
              </div>
              <div className="text-sm text-gray-600">{d.status ?? '—'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
