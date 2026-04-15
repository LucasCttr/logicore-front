"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDriversWithDetails } from '../hooks/useDriversWithDetails';
import ListContainer from './ListContainer';
import FilterDrivers from './FilterDrivers';
import type { DriverDetailsWithUser } from '../types/driverDetails';
import DriverDetailsModal from './DriverDetailsModal';

export default function DriverList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverDetailsWithUser | null>(null);

  const router = useRouter();

  // Convert statusFilter to boolean for API
  const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active';

  const { data, isLoading, isError, error, refetch } = useDriversWithDetails(
    currentPage,
    itemsPerPage,
    searchQuery || undefined,
    isActiveFilter
  );

  const handleOpenDetailsModal = (driver: DriverDetailsWithUser) => {
    setSelectedDriver(driver);
    setShowDetailsModal(true);
  };

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalCount ?? 0;

  // Reset a página 1 cuando cambian filtros pero NO cuando cambia itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <>
      <ListContainer
        filters={
          <FilterDrivers
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
        isLoading={isLoading}
        error={isError ? error?.message ?? 'Error loading drivers' : null}
        isEmpty={items.length === 0}
        emptyMessage="No drivers available."
        pagination={
          totalItems > 0
            ? {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
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
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">License Expiry</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Insurance</th>
              <th className="text-left px-7 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((driver, idx) => {
              const fullName = `${driver.firstName} ${driver.lastName}`.trim() || 'No name';
              const initials = fullName
                .split(' ')
                .map((s: string) => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const licenseExpiry = new Date(driver.licenseExpiry);
              const insuranceExpiry = new Date(driver.insuranceExpiry);
              const now = new Date();
              const isLicenseExpired = licenseExpiry < now;
              const isInsuranceExpired = insuranceExpiry < now;

              const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <tr key={driver.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{fullName}</div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{driver.licenseNumber}</div>
                      <div className="text-xs text-gray-500">{driver.licenseType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${isLicenseExpired ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatDate(licenseExpiry)}
                      {isLicenseExpired && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${isInsuranceExpired ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatDate(insuranceExpiry)}
                      {isInsuranceExpired && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        driver.isUserActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {driver.isUserActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDetailsModal(driver)}
                      className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ListContainer>

      {selectedDriver && (
        <DriverDetailsModal
          isOpen={showDetailsModal}
          driver={selectedDriver}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDriver(null);
          }}
          onSuccess={() => {
            // Add a small delay to ensure backend has persisted changes
            setTimeout(() => {
              refetch();
            }, 500);
            setShowDetailsModal(false);
            setSelectedDriver(null);
          }}
        />
      )}
    </>
  );
}
