"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useToggleUserStatus } from '../hooks/useUsers';
import { useUsers } from '../hooks/useUsers';
import ListContainer from './ListContainer';
import FilterUsers from './FilterUsers';
import type { User } from '../types/users';

export default function UserList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { data, isLoading, isError, error, refetch } = useUsers(currentPage, itemsPerPage);
  const toggleStatus = useToggleUserStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleToggleStatus = async (id: string, current?: boolean) => {
    try {
      await toggleStatus.mutateAsync({ id, isActive: !current });
    } catch (e) {
      // ignore - UI will refresh from react-query
    }
  };

  let items = data?.items ?? [];

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
    const matchesSearch =
      (item.userName?.toLowerCase() || '').includes(searchLower) ||
      (fullName.toLowerCase() || '').includes(searchLower) ||
      (item.email?.toLowerCase() || '').includes(searchLower);

    // Filtro de estado
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calcular paginación
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = items.slice(startIdx, endIdx);

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const newButton = (
    <Link href="/users/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap">
      + New User
    </Link>
  );

  return (
    <>
      <ListContainer
        filters={
          <FilterUsers
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onItemsPerPageChange={setItemsPerPage}
            newButton={newButton}
          />
        }
        isLoading={isLoading}
        error={isError ? error?.message ?? 'Error loading users' : null}
        isEmpty={items.length === 0}
        emptyMessage="No users available."
        pagination={
          items.length > 0
            ? {
                currentPage,
                totalPages,
                totalItems: items.length,
                itemsPerPage: itemsPerPage,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roles</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email Verified</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((user: User) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.userName || 'Unknown'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role: string) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.emailConfirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.emailConfirmed ? '✓ Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ListContainer>
    </>
  );
}
