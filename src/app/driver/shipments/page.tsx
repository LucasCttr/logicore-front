"use client";

import React, { useState } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import { useShipments } from '../../../hooks/useShipments';

export default function DriverShipmentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch only active shipments for the current driver
  const { data, isLoading, isError, error } = useShipments(
    currentPage,
    itemsPerPage,
    { status: 'active' } // Only active shipments
  );

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (isError) {
    return (
      <AuthGuard requireRoles="Driver">
        <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700">
          Error loading shipments: {error?.message || 'Unknown error'}
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireRoles="Driver">
      <div className="p-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No active shipments at the moment.</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Shipment ID</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Route</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Packages</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((shipment: any, idx: number) => (
                    <tr key={shipment.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="px-6 py-4 font-mono text-sm text-gray-800">{shipment.id?.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {shipment.originLocationId ? `To ${shipment.destinationLocationId?.substring(0, 8)}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {shipment.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{shipment.packageCount || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  First
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Prev
                </button>
                <span className="px-3 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
