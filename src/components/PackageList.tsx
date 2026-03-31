"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePackages, useDeliverPackage, useCancelPackage } from '../hooks/usePackages';

export default function PackageList() {
  const { data, isLoading, error } = usePackages(1, 20);
  const deliver = useDeliverPackage();
  const cancel = useCancelPackage();
  const router = useRouter();
  const [savingDeliverId, setSavingDeliverId] = React.useState<string | null>(null);
  const [savingCancelId, setSavingCancelId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  if (isLoading) return <div className="p-4">Loading packages...</div>;
  if (error) return <div className="p-4 text-red-600">{error.message}</div>;

  const items = data?.items ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Packages</h2>
        <Link href="/packages/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">New Package</Link>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">No packages available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="text-left px-4 py-3">Package</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Shipment</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, idx) => {
                const title = p.description ?? p.trackingNumber ?? 'Sin descripción';
                const initials = (p.trackingNumber ?? title).toString().split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase();
                return (
                  <tr key={p.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}`}>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{initials}</div>
                        <div>
                          <div className="font-medium text-gray-800">{p.trackingNumber ?? title}</div>
                          <div className="text-sm text-gray-500">{p.recipientName ?? ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-gray-600">{p.description ?? '-'}</td>
                    <td className="px-4 py-4 align-middle text-gray-600">{p.status ?? '-'}</td>
                    <td className="px-4 py-4 align-middle text-gray-600">{p.shipmentId ?? '-'}</td>
                    <td className="px-4 py-4 align-middle text-right">
                      <button onClick={() => router.push(`/packages/${p.id}`)} className="px-3 py-1 mr-2 border border-blue-300 text-blue-600 rounded">View</button>
                      <button
                        onClick={async () => {
                          setActionError(null);
                          setSavingDeliverId(p.id);
                          try {
                            await deliver.mutateAsync(p.id);
                          } catch (err: any) {
                            setActionError(err?.message ?? 'Error');
                          } finally {
                            setSavingDeliverId(null);
                          }
                        }}
                        disabled={savingDeliverId === p.id}
                        className="px-3 py-1 mr-2 bg-green-600 text-white rounded"
                      >
                        {savingDeliverId === p.id ? '...' : 'Deliver'}
                      </button>
                      <button
                        onClick={async () => {
                          setActionError(null);
                          setSavingCancelId(p.id);
                          try {
                            await cancel.mutateAsync(p.id);
                          } catch (err: any) {
                            setActionError(err?.message ?? 'Error');
                          } finally {
                            setSavingCancelId(null);
                          }
                        }}
                        disabled={savingCancelId === p.id}
                        className="px-3 py-1 rounded bg-rose-600 text-white"
                      >
                        {savingCancelId === p.id ? '...' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
    </div>
  );
}
