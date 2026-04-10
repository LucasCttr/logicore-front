"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useShipments } from '../hooks/useShipments';
import ListContainer from './ListContainer';

export default function ShipmentList() {
  const router = useRouter();
  const { data, isLoading, error } = useShipments(1, 20);

  const items = data?.items ?? [];

  return (
    <ListContainer
      title="Shipments"
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No shipments yet."
      actions={
        <button
          onClick={() => router.push('/shipments/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Shipment
        </button>
      }
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, idx) => (
            <tr key={s.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
              <td className="px-6 py-4 text-sm text-gray-900">{s.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{s.reference ?? '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{s.status ?? '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{s.driverId ?? '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{s.createdAt ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListContainer>
  );
}
