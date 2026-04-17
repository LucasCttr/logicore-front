"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShipments } from '../hooks/useShipments';
import { getDrivers } from '../api/drivers';
import { getLocations } from '../api/locations';
import type { LocationDto } from '../types/locations';
import ListContainer from './ListContainer';
import FilterShipments from './FilterShipments';
import { startShipment } from '../api/shipmentActions';

interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export default function ShipmentList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('all');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const router = useRouter();
  
  // Use single hook - it handles role-based endpoint logic internally
  const { data, isLoading, error } = useShipments(currentPage, itemsPerPage);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Start shipment states
  const [startingShipmentId, setStartingShipmentId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Load drivers and locations once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [driversData, locationsData] = await Promise.all([
          getDrivers(),
          getLocations()
        ]);
        setDrivers(driversData || []);
        setLocations(locationsData || []);
      } catch (err) {
        console.error('Error loading drivers/locations:', err);
      }
    };
    loadData();
  }, []);

  // Handle different data structures based on user role
  let items: any[] = [];
  let totalItems = 0;
  
  // useShipments now always returns PagedResultDto for both drivers and admins
  items = (data as any)?.items ?? [];
  totalItems = (data as any)?.totalCount ?? items.length;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.routeCode?.toLowerCase() || '').includes(searchLower) ||
      (item.destination?.toLowerCase() || '').includes(searchLower);

    // Filtro de tab
    // Backend statuses: 0=Draft, 1=Loading, 2=Dispatched, 3=Arrived, 4=Canceled
    let matchesTab = true;
    if (activeTab === 'in-progress') {
      matchesTab = item.status === 1 || item.status === 2; // Loading or Dispatched
    } else if (activeTab === 'completed') {
      matchesTab = item.status === 3; // Arrived
    }
    // 'all' shows everything

    return matchesSearch && matchesTab;
  });

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  // Helper function to get driver name by ID
  const getDriverName = (driverId: string | null): string => {
    if (!driverId) return '-';
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return driverId.substring(0, 8);
    return `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || driver.name || driverId.substring(0, 8);
  };

  // Helper function to get destination label by location ID
  const getDestinationLabel = (locationId: number | string | null | undefined): string => {
    if (!locationId) return 'Last Mile';
    const location = locations.find(l => String(l.id) === String(locationId));
    return location?.name || `Location #${locationId}`;
  };

  // Helper function to get status label with driver-friendly terminology
  const getUserRole = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (!roles) return null;
      if (Array.isArray(roles)) return roles[0];
      return String(roles).split(',')[0].trim();
    } catch (e) {
      return null;
    }
  };

  const getStatusLabel = (status: number): string => {
    const userRole = getUserRole();
    const isDriver = userRole === 'Driver';

    // Backend statuses: 0=Draft, 1=Loading, 2=Dispatched, 3=Arrived, 4=Canceled
    switch (status) {
      case 0: return 'Pending';
      case 1: return isDriver ? 'Active' : 'Loading';
      case 2: return isDriver ? 'Active' : 'Dispatched';
      case 3: return isDriver ? 'Completed' : 'Arrived';
      case 4: return 'Canceled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    // Backend statuses: 0=Draft, 1=Loading, 2=Dispatched, 3=Arrived, 4=Canceled
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800';    // Draft
      case 1: return 'bg-orange-100 text-orange-800';    // Loading
      case 2: return 'bg-blue-100 text-blue-800';        // Dispatched
      case 3: return 'bg-green-100 text-green-800';      // Arrived/Completed
      case 4: return 'bg-red-100 text-red-800';          // Canceled
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Detect user role
  const userRole = getUserRole();
  const isDriver = userRole === 'Driver';
  const isAdmin = userRole === 'Admin';

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
        // Refresh the shipments list - reload from server
        setCurrentPage(1);
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

  const createdCount = items.filter((s: any) => s.status === 0 || s.status === 1 || s.status === 2).length;
  const completedCount = items.filter((s: any) => s.status === 3).length;

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
              Pending & Active ({createdCount})
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed ({completedCount})
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
        isEmpty={items.length === 0}
        emptyMessage={`No ${activeTab === 'in-progress' ? 'in-progress' : activeTab === 'completed' ? 'completed' : ''} shipments.`}
        pagination={{
          currentPage,
          totalPages,
          totalItems: items.length,
          itemsPerPage: itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {items.map((s: any) => {
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
                <div className={`px-4 py-3 border-b border-gray-200 flex items-start justify-between ${
                  s.status === 3 ? 'bg-red-50' : s.status === 2 ? 'bg-green-50' : s.status === 1 ? 'bg-blue-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 break-words">{s.routeCode}</h3>
                    <p className="text-xs text-gray-500 mt-1">Created: {created}</p>
                  </div>
                  <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(s.status)}`}>
                    {getStatusLabel(s.status)}
                  </span>
                </div>

                {/* Main Content */}
                <div className="px-4 py-4 space-y-3">
                  {/* Destination */}
                  <div className="bg-gray-50 rounded-lg p-3">
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
                  <div className="grid grid-cols-2 gap-3">
                    {/* Packages */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-semibold uppercase">Packages</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{s.packageIds?.length ?? 0}</p>
                    </div>

                    {/* Estimated Delivery */}
                    <div className={`rounded-lg p-3 ${
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
                  <div className="border-t pt-3">
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
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/shipments/${s.id}`);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                  {s.status === 0 && isDriver && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartShipment(s.id);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition disabled:opacity-50"
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
