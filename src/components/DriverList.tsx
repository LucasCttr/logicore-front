"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUpdateDriverStatus } from '../hooks/useDriver';
import { useDrivers } from '../hooks/useDrivers';
import ListContainer from './ListContainer';
import FilterDrivers from './FilterDrivers';
import AssignVehicleModal from './AssignVehicleModal';
import type { Driver } from '../types/drivers';

export default function DriverList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { data, isLoading, isError, error, refetch } = useDrivers();
  const router = useRouter();
  const update = useUpdateDriverStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleToggleActive = async (id: string, current?: boolean) => {
    try {
      await update.mutateAsync({ id, payload: { isActive: !current } });
    } catch (e) {
      // ignore - UI will refresh from react-query
    }
  };

  const handleOpenAssignModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowAssignModal(true);
  };

  let items = data?.items ?? [];

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(searchLower) ||
      (item.fullName?.toLowerCase() || '').includes(searchLower) ||
      (item.email?.toLowerCase() || '').includes(searchLower) ||
      (item.phone?.toLowerCase() || '').includes(searchLower);

    // Filtro de estado
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calcular paginación
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = items.slice(startIdx, endIdx);

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const newButton = (
    <Link href="/drivers/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap">
      + New Driver
    </Link>
  );

  return (
    <>
      <ListContainer
        filters={
          <FilterDrivers
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onItemsPerPageChange={setItemsPerPage}
            newButton={newButton}
          />
        }
        isLoading={isLoading}
        error={isError ? error?.message ?? 'Error loading drivers' : null}
        isEmpty={items.length === 0}
        emptyMessage="No drivers available."
        pagination={
          items.length > 0
            ? {
                currentPage,
                totalPages,
                totalItems: items.length,
                itemsPerPage: itemsPerPage,
              onPageChange: setCurrentPage,
            }
          : undefined
      }
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Driver</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">License</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Assigned Vehicle</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Phone</th>
            <th className="text-left px-7 py-3 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((d, idx) => {
            const name = d.name ?? d.fullName ?? 'No name';
            const initials = name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
            return (
              <tr key={d.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">{initials}</div>
                    <div>
                      <div className="font-medium text-gray-800">{name}</div>
                      <div className="text-sm text-gray-500">{d.email ?? ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{d.licenseNumber ?? '-'}</td>
                <td className="px-6 py-4">
                  {d.assignedVehicle ? (
                    <div className="flex flex-col">
                      {d.assignedVehicle.model || d.assignedVehicle.make ? (
                        <>
                          <span className="text-sm font-medium text-gray-800">
                            {d.assignedVehicle.make && d.assignedVehicle.model
                              ? `${d.assignedVehicle.make} ${d.assignedVehicle.model}`
                              : d.assignedVehicle.model || d.assignedVehicle.make}
                          </span>
                          <span className="text-xs text-gray-600">{d.assignedVehicle.licensePlate || 'No plate'}</span>
                        </>
                      ) : d.assignedVehicle.licensePlate ? (
                        <>
                          <span className="text-sm font-medium text-gray-800">{d.assignedVehicle.licensePlate}</span>
                          <span className="text-xs text-gray-500">No make/model</span>
                        </>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                          ⚠️ Needs Update
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{d.phone ?? '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => router.push(`/drivers/${d.id}`)}
                    className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOpenAssignModal(d)}
                    className="px-3 py-1 border border-purple-300 text-purple-600 rounded hover:bg-purple-50 text-sm"
                  >
                    Assign Vehicle
                  </button>
                  <button
                    onClick={() => handleToggleActive(d.id, !!d.isActive)}
                    className={`px-3 py-1 rounded text-white text-sm ${d.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    {d.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ListContainer>

      {selectedDriver && (
        <AssignVehicleModal
          isOpen={showAssignModal}
          driverId={selectedDriver.id}
          driverName={selectedDriver.name}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedDriver(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedDriver(null);
            refetch();
          }}
        />
      )}
    </>
  );
}


