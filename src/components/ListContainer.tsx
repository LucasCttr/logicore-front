"use client";

import React from 'react';
import Pagination from './Pagination';

interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

interface ListContainerProps {
  children: React.ReactNode;
  filters?: React.ReactNode;
  pagination?: PaginationConfig;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export default function ListContainer({
  children,
  filters,
  pagination,
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'No items available.',
}: ListContainerProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow ">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow ">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full bg-white rounded-lg shadow ">
        {filters && <div className="">{filters}</div>}
        <div className="text-gray-500 p-4">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col">
      {filters && filters}
      <div className="overflow-x-auto flex-1">
        {children}
      </div>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
