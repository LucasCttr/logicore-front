"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '../hooks/useVehicles';
import ListContainer from './ListContainer';
import FilterVehicles from './FilterVehicles';
import EditVehicleModal from './EditVehicleModal';
import type { Vehicle } from '../api/vehicles';

export default function VehicleList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const router = useRouter();
  const { data, isLoading, error, refetch } = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  let items = data?.items ?? [];

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.plate?.toLowerCase() || '').includes(searchLower) ||
      (item.model?.toLowerCase() || '').includes(searchLower) ||
      (item.make?.toLowerCase() || '').includes(searchLower);

    // Filtro de estado
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'available' && item.isActive) ||
      (statusFilter === 'unavailable' && !item.isActive);

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

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  const newButton = (
    <button
      onClick={() => router.push('/vehicles/new')}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap"
    >
      + New Vehicle
    </button>
  );

  return (
    <>
      <ListContainer
        filters={
          <FilterVehicles
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onItemsPerPageChange={setItemsPerPage}
            newButton={newButton}
          />
        }
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No vehicles available."
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
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">License Plate</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Make</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Model</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Max Weight (kg)</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Max Volume (m³)</th>
            <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((vehicle, idx) => (
            <tr key={vehicle.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
              <td className="px-6 py-4 font-semibold text-gray-800">{vehicle.licensePlate || '-'}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.make || '-'}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.model || '-'}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.maxWeightCapacity}</td>
              <td className="px-6 py-4 text-gray-600">{vehicle.maxVolumeCapacity}</td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => handleOpenEditModal(vehicle)}
                  className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </ListContainer>

      {selectedVehicle && (
        <EditVehicleModal
          isOpen={showEditModal}
          vehicle={selectedVehicle}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
