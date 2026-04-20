"use client";

import React from 'react';

interface FilterLocationsProps {
  onSearch: (query: string) => void;
  onItemsPerPageChange?: (items: number) => void;
  newButton?: React.ReactNode;
}

export default function FilterLocations({ onSearch, onItemsPerPageChange, newButton }: FilterLocationsProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by city, country or address..."
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        {onItemsPerPageChange && (
          <select
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            defaultValue="15"
          >
            <option value="10">10 items</option>
            <option value="15">15 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        )}
        {newButton}
      </div>
    </div>
  );
}
