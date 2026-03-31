"use client";

import React from 'react';
import { usePackage, usePackageHistory, useDeliverPackage, useCancelPackage } from '../hooks/usePackages';

type Props = { id: string };

export default function PackageDetail({ id }: Props) {
  const { data, isLoading, error } = usePackage(id);
  const { data: history } = usePackageHistory(id);
  const deliver = useDeliverPackage();
  const cancel = useCancelPackage();
  const [savingDeliver, setSavingDeliver] = React.useState(false);
  const [savingCancel, setSavingCancel] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  if (isLoading) return <div>Loading package...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  const pkg = data;
  if (!pkg) return <div>Package not found.</div>;

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-xl font-semibold mb-3">Package</h2>
      <div className="mb-2"><strong>Tracking:</strong> {pkg.trackingNumber ?? '-'}</div>
      <div className="mb-2"><strong>Description:</strong> {pkg.description ?? '-'}</div>
      <div className="mb-2"><strong>Status:</strong> {pkg.status ?? '-'}</div>
      <div className="mb-2"><strong>Shipment:</strong> {pkg.shipmentId ?? '-'}</div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={async () => {
            setActionError(null);
            setSavingDeliver(true);
            try {
              await deliver.mutateAsync(pkg.id);
            } catch (err: any) {
              setActionError(err?.message ?? 'Error');
            } finally {
              setSavingDeliver(false);
            }
          }}
          disabled={savingDeliver}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          {savingDeliver ? 'Working...' : 'Deliver'}
        </button>
        <button
          onClick={async () => {
            setActionError(null);
            setSavingCancel(true);
            try {
              await cancel.mutateAsync(pkg.id);
            } catch (err: any) {
              setActionError(err?.message ?? 'Error');
            } finally {
              setSavingCancel(false);
            }
          }}
          disabled={savingCancel}
          className="px-3 py-2 bg-red-600 text-white rounded"
        >
          {savingCancel ? 'Working...' : 'Cancel'}
        </button>
        {actionError && <div className="text-red-600 mt-2">{actionError}</div>}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">History</h3>
        {(!history || history.length === 0) ? (
          <div>No history available.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((h: any, idx: number) => (
              <li key={idx} className="text-sm text-gray-700">{h.at} — {h.status ?? h.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
