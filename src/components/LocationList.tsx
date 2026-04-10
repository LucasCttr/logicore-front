"use client";

import React from 'react';
import { useLocations } from '../hooks/useLocations';
import ListContainer from './ListContainer';

interface LocationListProps {
  onAddClick?: () => void;
  isFormOpen?: boolean;
}

export default function LocationList({ onAddClick, isFormOpen }: LocationListProps) {
  const { data, isLoading, error } = useLocations();

  const items = data ?? [];

  return (
    <ListContainer
      title="Distribution Centers & Locations"
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No locations available. Add one to get started."
      actions={
        onAddClick ? (
          <button
            onClick={onAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
          >
            {isFormOpen ? 'Cancel' : '+ Add Location'}
          </button>
        ) : null
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((location) => (
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
    </ListContainer>
  );
}
