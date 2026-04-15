"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShipments } from '../hooks/useShipments';
import ListContainer from './ListContainer';
import FilterShipments from './FilterShipments';

export default function ShipmentList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('all');
  const router = useRouter();
  const { data, isLoading, error } = useShipments(currentPage, itemsPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  let items = data?.items ?? [];
  const totalItems = (data as any)?.totalCount ?? items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.routeCode?.toLowerCase() || '').includes(searchLower) ||
      (item.destination?.toLowerCase() || '').includes(searchLower);

    // Filtro de tab
    let matchesTab = true;
    if (activeTab === 'in-progress') {
      matchesTab = item.status === 0 || item.status === 1; // Pending or In Transit
    } else if (activeTab === 'completed') {
      matchesTab = item.status === 2; // Delivered
    }
    // 'all' shows everything

    return matchesSearch && matchesTab;
  });

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  const newButton = (
    <button
      onClick={() => router.push('/shipments/new')}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
    >
      + New Shipment
    </button>
  );

  const createdCount = (data?.items ?? []).filter((s: any) => s.status === 0 || s.status === 1).length;
  const completedCount = (data?.items ?? []).filter((s: any) => s.status === 2).length;

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('in-progress'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'in-progress'
                  ? 'bg-blue-100 text-blue-800 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Progress ({createdCount})
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'completed'
                  ? 'bg-green-100 text-green-800 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-gray-100 text-gray-800 border-b-2 border-gray-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>

          {/* New Shipment Button */}
          <div>
            {newButton}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="">
          <FilterShipments
            onSearch={setSearchQuery}
            onStatusFilter={() => {}} // Status filter handled by tabs now
            onDateFilter={(start, end) => {
              if (start) setDateStart(start);
              if (end) setDateEnd(end);
            }}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      <ListContainer
        isLoading={isLoading}
        error={error?.message ?? null}
        isEmpty={items.length === 0}
        emptyMessage={`No ${activeTab === 'in-progress' ? 'in-progress' : activeTab === 'completed' ? 'completed' : ''} shipments.`}
        pagination={{
          currentPage,
          totalPages,
          totalItems: items.length,
          itemsPerPage: itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Packages</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
              {activeTab === 'in-progress' && (
                <>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Est. Delivery</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Delivered On</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                </>
              )}
              {activeTab === 'all' && (
                <>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Updated</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((s: any, idx: number) => {
              const statusLabel = 
                s.status === 0 ? 'Pending' :
                s.status === 1 ? 'In Transit' :
                s.status === 2 ? 'Delivered' :
                s.status === 3 ? 'Canceled' : 'Unknown';
              
              const estDelivery = s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : '-';
              const created = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-';
              const delivered = s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : '-';
              const shipped = s.shippedAt ? new Date(s.shippedAt) : null;
              const deliveryDate = s.deliveredAt ? new Date(s.deliveredAt) : null;
              
              let duration = '-';
              if (shipped && deliveryDate) {
                const diffMs = deliveryDate.getTime() - shipped.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                duration = `${diffDays}d ${diffHours}h`;
              }
              
              return (
                <tr key={s.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer`} onClick={() => router.push(`/shipments/${s.id}`)}>
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
                  <td className="px-6 py-4 text-sm text-gray-600">{s.packageIds?.length ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.driverId ? s.driverId.substring(0, 8) : '-'}</td>
                  {activeTab === 'in-progress' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600">{estDelivery}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{created}</td>
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600">{delivered}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{duration}</td>
                    </>
                  )}
                  {activeTab === 'all' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-600">{created}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.shippedAt ? new Date(s.shippedAt).toLocaleDateString() : '-'}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ListContainer>
    </>
  );
}
