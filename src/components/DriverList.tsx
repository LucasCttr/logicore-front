"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUpdateDriverStatus } from '../hooks/useDriver';
import { useDrivers } from '../hooks/useDrivers';
import ListContainer from './ListContainer';

export default function DriverList() {
  const { data, isLoading, isError, error, refetch } = useDrivers();
  const router = useRouter();
  const update = useUpdateDriverStatus();

  const handleToggleActive = async (id: string, current?: boolean) => {
    try {
      await update.mutateAsync({ id, payload: { isActive: !current } });
    } catch (e) {
      // ignore - UI will refresh from react-query
    }
  };

  const items = data?.items ?? [];

  return (
    <ListContainer
      title="Drivers"
      isLoading={isLoading}
      error={isError ? error?.message ?? 'Error loading drivers' : null}
      isEmpty={items.length === 0}
      emptyMessage="No drivers available."
      actions={
        <Link href="/drivers/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          + New Driver
        </Link>
      }
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Driver</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">License</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Phone</th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d, idx) => {
            const name = d.name ?? d.fullName ?? 'Sin nombre';
            const initials = name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
            return (
              <tr key={d.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">{initials}</div>
                    <div>
                      <div className="font-medium text-gray-800">{name}</div>
                      <div className="text-sm text-gray-500">{d.email ?? ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{d.licenseNumber ?? '-'}</td>
                <td className="px-6 py-4 text-gray-600">{d.phone ?? '-'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <span className={`text-sm font-medium ${d.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => router.push(`/drivers/${d.id}`)}
                    className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleToggleActive(d.id, !!d.isActive)}
                    className={`px-3 py-1 rounded text-white text-sm ${d.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ListContainer>
  );
}
