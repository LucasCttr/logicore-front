"use client";

import React from 'react';
import { useLocations } from '../hooks/useLocations';

export default function LocationList() {
  const { data, isLoading, error } = useLocations();

  if (isLoading) return <div>Loading locations...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  const items = data ?? [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Locations</h2>
      {items.length === 0 ? (
        <div>No hay locations.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((l) => (
            <li key={l.id} className="border p-2 rounded">
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-gray-600">{l.address ?? '-'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
