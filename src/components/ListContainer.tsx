"use client";

import React from 'react';

interface ListContainerProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export default function ListContainer({
  title,
  children,
  actions,
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'No items available.',
}: ListContainerProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
