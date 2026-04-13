"use client";

import React from 'react';

interface FilterShipmentsProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onDateFilter: (startDate: string, endDate: string) => void;
  onItemsPerPageChange?: (items: number) => void;
  newButton?: React.ReactNode;
}

export default function FilterShipments({ onSearch, onStatusFilter, onDateFilter, onItemsPerPageChange, newButton }: FilterShipmentsProps) {
  return (
    <div className="p-6 border-b border-gray-200 space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by route or destination..."
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <select
          onChange={(e) => onStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="completed">Completed</option>
        </select>
        {onItemsPerPageChange && (
          <select
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            defaultValue="14"
          >
            <option value="10">10 items</option>
            <option value="14">14 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        )}
        {newButton}
      </div>
      <div className="flex gap-4 items-center flex-wrap">
        <label className="text-sm text-gray-600">From:</label>
        <input
          type="date"
          onChange={(e) => onDateFilter(e.target.value, '')}
          className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <label className="text-sm text-gray-600">To:</label>
        <input
          type="date"
          onChange={(e) => onDateFilter('', e.target.value)}
          className="px-4 py-2 bg-white border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>
    </div>
  );
}
