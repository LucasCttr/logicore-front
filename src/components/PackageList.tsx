"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePackages, useDeliverPackage, useCancelPackage } from '../hooks/usePackages';
import ListContainer from './ListContainer';

const getStatusLabel = (status: any) => {
  if (status === null || status === undefined) return '-';
  const asNumber = typeof status === 'number' ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return 'Pending';
      case 1:
        return 'In Transit';
      case 2:
        return 'Delivered';
      case 3:
        return 'Canceled';
      case 4:
        return 'At Depot';
      case 5:
        return 'Delivered (Center)';
      default:
        return String(status);
    }
  }
  return String(status);
};

const getStatusBadgeClass = (status: any) => {
  if (status === null || status === undefined) return 'bg-gray-100 text-gray-800';
  const asNumber = typeof status === 'number' ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      case 5:
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  return 'bg-gray-100 text-gray-800';
};

export default function PackageList() {
  const { data, isLoading, error } = usePackages(1, 20);
  const deliver = useDeliverPackage();
  const cancel = useCancelPackage();
  const router = useRouter();
  const [savingDeliverId, setSavingDeliverId] = React.useState<string | null>(null);
  const [savingCancelId, setSavingCancelId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const items = data?.items ?? [];

  return (
    <>
      <ListContainer
        title="Packages"
        isLoading={isLoading}
        error={error?.message ?? null}
        isEmpty={items.length === 0}
        emptyMessage="No packages available."
        actions={
          <Link href="/packages/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            + New Package
          </Link>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Tracking</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Recipient</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Destination</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, idx) => {
              const title = p.trackingNumber ?? 'Sin descripción';
              const destination = (p as any).recipient?.address ?? p.destination ?? '-';
              const recipientName = (p as any).recipient?.name ?? '-';

              return (
                <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="px-6 py-4 font-medium text-gray-800">{title}</td>
                  <td className="px-6 py-4 text-gray-600">{recipientName}</td>
                  <td className="px-6 py-4 text-gray-600">{destination}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusBadgeClass(p.status)}`}>
                      {getStatusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/packages/${p.id}`)}
                      className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                    >
                      View
                    </button>
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
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                      className="px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {savingCancelId === p.id ? '...' : 'Cancel'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ListContainer>
      {actionError && <div className="text-red-600 mt-4 p-3 bg-red-50 rounded">{actionError}</div>}
    </>
  );
}
