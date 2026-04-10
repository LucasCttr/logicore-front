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
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route Code</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Packages</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Est. Delivery</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, idx) => {
            const statusLabel = 
              s.status === 0 ? 'Pending' :
              s.status === 1 ? 'In Transit' :
              s.status === 2 ? 'Delivered' :
              s.status === 3 ? 'Canceled' : 'Unknown';
            
            const estDelivery = s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : '-';
            const created = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-';
            
            return (
              <tr key={s.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.routeCode ?? '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${s.status === 0 ? 'bg-yellow-100 text-yellow-800' : 
                      s.status === 1 ? 'bg-blue-100 text-blue-800' :
                      s.status === 2 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.packageIds?.length ?? 0} package(s)</td>
                <td className="px-6 py-4 text-sm text-gray-600">{estDelivery}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{created}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ListContainer>
  );
}
