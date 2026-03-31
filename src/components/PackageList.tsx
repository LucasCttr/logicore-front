"use client";

import React from 'react';
import { usePackages, useDeliverPackage, useCancelPackage } from '../hooks/usePackages';

export default function PackageList() {
  const { data, isLoading, error } = usePackages(1, 20);
  const deliver = useDeliverPackage();
  const cancel = useCancelPackage();
  const [savingDeliverId, setSavingDeliverId] = React.useState<string | null>(null);
  const [savingCancelId, setSavingCancelId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  if (isLoading) return <div className="p-4">Loading packages...</div>;
  if (error) return <div className="p-4 text-red-600">{error.message}</div>;

  const items = data?.items ?? [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Packages</h2>
      {items.length === 0 ? (
        <div>No hay packages.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Tracking</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Shipment</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.trackingNumber ?? '-'}</td>
                <td className="px-3 py-2">{p.description ?? '-'}</td>
                <td className="px-3 py-2">{p.status ?? '-'}</td>
                <td className="px-3 py-2">{p.shipmentId ?? '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
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
                      className="px-2 py-1 bg-green-600 text-white rounded"
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
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      {savingCancelId === p.id ? '...' : 'Cancel'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
    </div>
  );
}
