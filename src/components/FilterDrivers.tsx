"use client";

import React from 'react';

interface FilterDriversProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
  onItemsPerPageChange?: (items: number) => void;
  newButton?: React.ReactNode;
}

export default function FilterDrivers({ onSearch, onStatusFilter, onItemsPerPageChange, newButton }: FilterDriversProps) {
  return (
    <div className="p-6 border-b border-gray-200 space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by driver name, email or license number..."
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <select
          onChange={(e) => onStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
