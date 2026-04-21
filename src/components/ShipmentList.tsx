"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useShipments, getUserRoleFromToken } from '../hooks/useShipments';
import { getLocations } from '../api/locations';
import type { LocationDto } from '../types/locations';
import ListContainer from './ListContainer';
import { startShipment } from '../api/shipmentActions';
import { parseShipmentStatus } from '../api/shipmentMappers';

export default function ShipmentList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('all');
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = getUserRoleFromToken();
  const isDriver = userRole === 'Driver';
  const isAdmin = userRole === 'Admin';

  const adminListFilters = useMemo(
    () => ({
      q: searchQuery.trim() || undefined,
      status:
        activeTab === 'completed'
          ? 'Completed'
          : activeTab === 'in-progress'
            ? 'InProgress'
            : undefined,
      sortBy: 'createdAt',
      sortDir: 'desc',
    }),
    [searchQuery, activeTab]
  );

  const { data, isLoading, error } = useShipments(
    currentPage,
    itemsPerPage,
    isDriver ? undefined : adminListFilters
  );

  // Start shipment states
  const [startingShipmentId, setStartingShipmentId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Load drivers and locations once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData || []);
      } catch (err) {
        console.error('Error loading locations:', err);
      }
    };
    loadData();
  }, []);

  const rawItems: any[] = (data as any)?.items ?? [];
  const totalFromApi = (data as any)?.total ?? (data as any)?.totalCount ?? rawItems.length;

  const matchesSearch = (item: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.routeCode?.toLowerCase() || '').includes(searchLower) ||
      (item.destination?.toLowerCase() || '').includes(searchLower)
    );
  };

  const shipmentSt = (item: any) => parseShipmentStatus(item.status);

  const matchesTab = (item: any) => {
    const st = shipmentSt(item);
    if (activeTab === 'in-progress') return st === 1 || st === 2;
    if (activeTab === 'completed') return st === 3 || st === 5;
    return true;
  };

  const searchOnlyItems = isDriver ? rawItems.filter((item: any) => matchesSearch(item)) : [];

  let sortedItems: any[];
  if (isDriver) {
    sortedItems = rawItems
      .filter((item: any) => matchesSearch(item) && matchesTab(item))
      .sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  } else {
    sortedItems = [...rawItems].sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  const totalItems = isDriver ? sortedItems.length : totalFromApi;
  const filteredTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage) || 1);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = isDriver
    ? sortedItems.slice(startIdx, startIdx + itemsPerPage)
    : sortedItems;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  const locationNameMap = useMemo(() => {
    const sortedLocations = [...locations]
      .filter(location => location.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    const map: Record<number, string> = {};
    sortedLocations.forEach((location, index) => {
      map[index + 1] = location.name;
    });

    return map;
  }, [locations]);

  // Helper function to get destination label by location ID
  const getDestinationLabel = (locationId: number | string | null | undefined): string => {
    if (locationId === null || locationId === undefined || locationId === '') {
      return 'Last Mile';
    }

    const numericLocationId = Number(locationId);
    if (Number.isNaN(numericLocationId)) {
      return `Location #${locationId}`;
    }

    return locationNameMap[numericLocationId] || `Location #${numericLocationId}`;
  };

  const getStatusLabel = (status: unknown): string => {
    const isDriverRole = userRole === 'Driver';
    const st = parseShipmentStatus(status);

    // Backend ShipmentStatus: Draft=0, Loading=1, Dispatched=2, Arrived=3, Canceled=4, Delivered=5
    switch (st) {
      case 0: return 'Pending';
      case 1: return isDriverRole ? 'Active' : 'Loading';
      case 2: return isDriverRole ? 'Active' : 'Dispatched';
      case 3: return isDriverRole ? 'Completed' : 'Arrived';
      case 4: return 'Canceled';
      case 5: return isDriverRole ? 'Completed' : 'Delivered';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: unknown): string => {
    const st = parseShipmentStatus(status);
    switch (st) {
      case 0: return 'bg-yellow-100 text-yellow-800';    // Draft
      case 1: return 'bg-orange-100 text-orange-800';    // Loading
      case 2: return 'bg-blue-100 text-blue-800';        // Dispatched
      case 3: return 'bg-green-100 text-green-800';      // Arrived
      case 4: return 'bg-red-100 text-red-800';          // Canceled
      case 5: return 'bg-emerald-100 text-emerald-800'; // Delivered
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newButton = isAdmin ? (
    <button
      onClick={() => router.push('/shipments/new')}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
    >
      + New Shipment
    </button>
  ) : null;

  // Handle start shipment action
  const handleStartShipment = async (shipmentId: string) => {
    try {
      setStartingShipmentId(shipmentId);
      setStartError(null);
      
      const result = await startShipment(shipmentId);
      
      if (result.isSuccess) {
        setCurrentPage(1);
        await queryClient.invalidateQueries({ queryKey: ['shipments'] });
      } else {
        setStartError(result.error || 'Failed to start shipment');
        // Keep error visible for 5 seconds
        setTimeout(() => setStartError(null), 5000);
      }
    } catch (err: any) {
      console.error('Error starting shipment:', err);
      setStartError(err?.message || 'Error starting shipment');
      setTimeout(() => setStartError(null), 5000);
    } finally {
      setStartingShipmentId(null);
    }
  };

  const createdCount = isDriver
    ? searchOnlyItems.filter((s: any) => {
        const st = parseShipmentStatus(s.status);
        return st === 0 || st === 1 || st === 2;
      }).length
    : 0;
  const completedCount = isDriver
    ? searchOnlyItems.filter((s: any) => {
        const st = parseShipmentStatus(s.status);
        return st === 3 || st === 5;
      }).length
    : 0;

  return (
    <>
      {/* Start Shipment Error Alert */}
      {startError && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
          <span>{startError}</span>
          <button 
            onClick={() => setStartError(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white border-b border-gray-200">

        {/* Tabs with New Shipment Button */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => { setActiveTab('in-progress'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                activeTab === 'in-progress'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending & Active
              {isDriver ? ` (${createdCount})` : activeTab === 'in-progress' && isAdmin ? ` (${totalFromApi})` : ''}
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed
              {isDriver ? ` (${completedCount})` : activeTab === 'completed' && isAdmin ? ` (${totalFromApi})` : ''}
            </button>
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                activeTab === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
              {isDriver ? ` (${searchOnlyItems.length})` : activeTab === 'all' && isAdmin ? ` (${totalFromApi})` : ''}
            </button>
          </div>
          
          {/* New Shipment Button - For Admins Only */}
          <div>
            {newButton}
          </div>
        </div>

        {/* Simple Search Bar */}
        <div className="px-6 py-3 border-t border-gray-200">
          <input
            type="text"
            placeholder="Search by route code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <ListContainer
        isLoading={isLoading}
        error={error?.message ?? null}
        isEmpty={paginatedItems.length === 0}
        emptyMessage={`No ${activeTab === 'in-progress' ? 'in-progress' : activeTab === 'completed' ? 'completed' : ''} shipments.`}
        pagination={{
          currentPage,
          totalPages: filteredTotalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 p-3">
          {paginatedItems.map((s: any) => {
            const st = shipmentSt(s);
            const estDelivery = s.estimatedDelivery ? new Date(s.estimatedDelivery) : null;
            const estDeliveryDate = estDelivery?.toLocaleDateString() || '-';
            const estDeliveryTime = estDelivery?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
            const created = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-';
            const isDaysAway = estDelivery ? Math.ceil((estDelivery.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            const isOverdue = isDaysAway !== null && isDaysAway < 0;
            const isToday = isDaysAway === 0;
            const isSoon = isDaysAway && isDaysAway > 0 && isDaysAway <= 3;

            return (
              <div
                key={s.id}
                onClick={() => router.push(`/shipments/${s.id}`)}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Header with Status */}
                <div className={`px-3.5 py-2.5 border-b border-gray-200 flex items-start justify-between ${
                  st === 4
                    ? 'bg-red-50'
                    : st === 3 || st === 5
                      ? 'bg-green-50'
                      : st === 2
                        ? 'bg-blue-50'
                        : st === 1
                          ? 'bg-orange-50'
                          : 'bg-yellow-50'
                }`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 break-words">{s.routeCode}</h3>
                    <p className="text-xs text-gray-500 mt-1">Created: {created}</p>
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </div>

                {/* Main Content */}
                <div className="px-3.5 py-3 space-y-2.5">
                  {/* Destination */}
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Destination</p>
                    <p className={`text-sm font-medium mt-1 flex items-center gap-2 ${
                      !s.destinationLocationId ? 'text-purple-700' : 'text-blue-700'
                    }`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        !s.destinationLocationId ? 'bg-purple-500' : 'bg-blue-500'
                      }`}></span>
                      {getDestinationLabel(s.destinationLocationId)}
                    </p>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Packages */}
                    <div className="bg-blue-50 rounded-lg p-2.5">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Packages</p>
                      <p className="text-xl font-bold text-blue-900 mt-1 leading-tight">{s.packageIds?.length ?? 0}</p>
                    </div>

                    {/* Estimated Delivery */}
                    <div className={`rounded-lg p-2.5 ${
                      isOverdue ? 'bg-red-50' : isToday ? 'bg-orange-50' : isSoon ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <p className={`text-xs font-semibold uppercase ${
                        isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : isSoon ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Est. Delivery
                      </p>
                      <p className={`text-sm font-bold mt-1 ${
                        isOverdue ? 'text-red-900' : isToday ? 'text-orange-900' : isSoon ? 'text-yellow-900' : 'text-green-900'
                      }`}>
                        {estDeliveryDate}
                      </p>
                      {estDeliveryTime && (
                        <p className={`text-xs ${
                          isOverdue ? 'text-red-700' : isToday ? 'text-orange-700' : isSoon ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          {estDeliveryTime}
                        </p>
                      )}
                      {isDaysAway !== null && (
                        <p className={`text-xs font-semibold mt-1 ${
                          isOverdue ? 'text-red-700' : isToday ? 'text-orange-700' : isSoon ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          {isOverdue ? `${Math.abs(isDaysAway)} days overdue` : isToday ? 'Today!' : `In ${isDaysAway} days`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Capacity */}
                  <div className="border-t border-gray-200 pt-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600 font-semibold">Weight Cap.</p>
                        <p className="text-gray-900 font-medium">{s.vehicleMaxWeightCapacity} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Volume Cap.</p>
                        <p className="text-gray-900 font-medium">{s.vehicleMaxVolumeCapacity} m³</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-3.5 py-2.5 border-t border-gray-200 bg-gray-50 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/shipments/${s.id}`);
                    }}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                  {st === 0 && isDriver && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartShipment(s.id);
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
                      disabled={startingShipmentId === s.id}
                    >
                      {startingShipmentId === s.id ? 'Starting...' : 'Start'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ListContainer>
    </>
  );
}
