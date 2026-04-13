"use client";

import React, { useState } from 'react';
import { useLocations } from '../hooks/useLocations';
import FilterLocations from './FilterLocations';
import Pagination from './Pagination';

interface LocationListProps {
  onAddClick?: () => void;
  isFormOpen?: boolean;
}

export default function LocationList({ onAddClick, isFormOpen }: LocationListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(14);
  const { data, isLoading, error } = useLocations();
  const [searchQuery, setSearchQuery] = useState('');

  let items = data ?? [];

  // Aplicar filtro de búsqueda
  items = items.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.name?.toLowerCase() || '').includes(searchLower) ||
      (item.city?.toLowerCase() || '').includes(searchLower) ||
      (item.country?.toLowerCase() || '').includes(searchLower) ||
      (item.addressLine1?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = items.slice(startIdx, endIdx);

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const newButton = onAddClick ? (
    <button
      onClick={onAddClick}
      className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 whitespace-nowrap"
    >
      {isFormOpen ? 'Cancel' : '+ Add Location'}
    </button>
  ) : null;

  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <FilterLocations onSearch={setSearchQuery} onItemsPerPageChange={setItemsPerPage} newButton={newButton} />
      {isLoading && (
        <div className="p-6 text-gray-500">Loading...</div>
      )}
      {error && (
        <div className="p-6 text-red-600">{error?.message ?? null}</div>
      )}
      {!isLoading && !error && (
        <>
          {items.length === 0 ? (
            <div className="p-6 text-gray-500">No locations available. Add one to get started.</div>
          ) : (
            <div className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedItems.map((location) => (
                  <div
                    key={location.id}
                    className="p-4 bg-white rounded border border-gray-200 shadow hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{location.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {location.addressLine1 && <p>{location.addressLine1}</p>}
                      {location.addressLine2 && <p className="text-gray-500">{location.addressLine2}</p>}
                      <p>
                        {[location.city, location.state, location.postalCode].filter(Boolean).join(', ')}
                      </p>
                      {location.country && <p className="text-gray-500">{location.country}</p>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(location.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {items.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={items.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
