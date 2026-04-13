"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePackages, useCancelPackage } from '../hooks/usePackages';
import ListContainer from './ListContainer';
import FilterPackages from './FilterPackages';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { data, isLoading, error } = usePackages(currentPage, itemsPerPage);
  const cancel = useCancelPackage();
  const router = useRouter();
  const [savingCancelId, setSavingCancelId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      (item.trackingNumber?.toLowerCase() || '').includes(searchLower) ||
      ((item as any).recipient?.name?.toLowerCase() || '').includes(searchLower) ||
      ((item as any).recipient?.address?.toLowerCase() || '').includes(searchLower);

    // Filtro de estado
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'pending' && item.status === 0) ||
      (statusFilter === 'in_transit' && item.status === 1) ||
      (statusFilter === 'delivered' && item.status === 2);

    return matchesSearch && matchesStatus;
  });

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const newButton = (
    <Link href="/packages/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap">
      + New Package
    </Link>
  );

  return (
    <ListContainer
      filters={
          <FilterPackages
          onSearch={setSearchQuery}
          onStatusFilter={setStatusFilter}
          onDateFilter={(start, end) => {
            if (start) setDateStart(start);
            if (end) setDateEnd(end);
          }}
          onItemsPerPageChange={setItemsPerPage}
          newButton={newButton}
        />
      }
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No packages available."
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: itemsPerPage,
        onPageChange: setCurrentPage,
      }}
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
            const title = p.trackingNumber ?? 'No description';
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
                      setSavingCancelId(p.id);
                      try {
                        await cancel.mutateAsync(p.id);
                      } catch (err: any) {
                        console.error(err?.message ?? 'Error');
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
  );
}
