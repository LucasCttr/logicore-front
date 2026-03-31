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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Drivers</h2>
        <Link href="/drivers/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">New Driver</Link>
      </div>

      {(!data || data.length === 0) ? (
        <div className="text-gray-500">No drivers available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left px-4 py-3">Driver</th>
                <th className="text-left px-4 py-3">License</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => {
                const name = d.name ?? d.fullName ?? 'Sin nombre';
                const initials = name.split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase();
                return (
                  <tr key={d.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{initials}</div>
                        <div>
                          <div className="font-medium text-gray-800">{name}</div>
                          <div className="text-sm text-gray-500">{d.email ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-gray-600">{d.licenseNumber ?? '-'}</td>
                    <td className="px-4 py-4 align-middle text-gray-600">{d.phone ?? '-'}</td>
                    <td className="px-4 py-4 align-middle text-right">
                      <span className={`mr-3 text-sm font-medium ${d.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>{d.isActive ? 'Active' : 'Inactive'}</span>
                      <button onClick={() => router.push(`/drivers/${d.id}`)} className="px-3 py-1 mr-2 border border-blue-300 text-blue-600 rounded">View</button>
                      <button onClick={() => handleToggleActive(d.id, !!d.isActive)} className={`px-3 py-1 rounded ${d.isActive ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>{d.isActive ? 'Deactivate' : 'Activate'}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
