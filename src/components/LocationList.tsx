"use client";

import React from 'react';
import { useLocations } from '../hooks/useLocations';
import ListContainer from './ListContainer';

export default function LocationList() {
  const { data, isLoading, error } = useLocations();

  const items = data ?? [];

  return (
    <ListContainer
      title="Locations"
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No locations available."
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Address</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l, idx) => (
            <tr key={l.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
              <td className="px-6 py-4 font-medium text-gray-800">{l.name}</td>
              <td className="px-6 py-4 text-gray-600">{l.address ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListContainer>
  );
}
