"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useShipments } from '../hooks/useShipments';

export default function ShipmentList() {
  const router = useRouter();
  const { data, isLoading, error } = useShipments(1, 20);

  if (isLoading) return <div>Loading shipments...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  const items = data?.items ?? [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Shipments</h2>
        <button
          onClick={() => router.push('/shipments/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Shipment
        </button>
      </div>
      {items.length === 0 ? (
        <div>No shipments yet.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Reference</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Driver</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.id}</td>
                <td className="px-3 py-2">{s.reference ?? '-'}</td>
                <td className="px-3 py-2">{s.status ?? '-'}</td>
                <td className="px-3 py-2">{s.driverId ?? '-'}</td>
                <td className="px-3 py-2">{s.createdAt ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
