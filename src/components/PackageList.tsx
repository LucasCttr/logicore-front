"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePackages, useCancelPackage } from "../hooks/usePackages";
import ListContainer from "./ListContainer";
import FilterPackages from "./FilterPackages";
import { getLocations } from "../api/locations";
import type LocationDto from "../types/locations";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const getPriorityLabel = (priority: any) => {
  if (priority === null || priority === undefined) return "Standard";
  const asNumber =
    typeof priority === "number" ? priority : Number(priority as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return "Standard";
      case 1:
        return "Express";
      case 2:
        return "Economic";
      default:
        return "Standard";
    }
  }
  return "Standard";
};

const getPriorityBadgeClass = (priority: any) => {
  if (priority === null || priority === undefined)
    return "bg-gray-100 text-gray-800";
  const asNumber =
    typeof priority === "number" ? priority : Number(priority as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return "bg-gray-100 text-gray-800";
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  return "bg-gray-100 text-gray-800";
};

const getStatusLabel = (status: any) => {
  if (status === null || status === undefined) return "-";
  const asNumber = typeof status === "number" ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return "Pending";
      case 1:
        return "In Transit";
      case 2:
        return "Delivered";
      case 3:
        return "Canceled";
      case 4:
        return "At Depot";
      case 5:
        return "Delivered to Center";
      case 6:
        return "Returned";
      case 7:
        return "Collected";
      case 8:
        return "Last-Mile";
      default:
        return String(status);
    }
  }
  return String(status);
};

const getStatusBadgeClass = (status: any) => {
  if (status === null || status === undefined)
    return "bg-gray-100 text-gray-800";
  const asNumber = typeof status === "number" ? status : Number(status as any);
  if (!Number.isNaN(asNumber)) {
    switch (asNumber) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-orange-100 text-orange-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-red-100 text-red-800";
      case 4:
        return "bg-purple-100 text-purple-800";
      case 5:
        return "bg-indigo-100 text-indigo-800";
      case 6:
        return "bg-red-100 text-red-800";
      case 7:
        return "bg-cyan-100 text-cyan-800";
      case 8:
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  return "bg-gray-100 text-gray-800";
};

export default function PackageList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { data, isLoading, error } = usePackages(currentPage, itemsPerPage);
  const cancel = useCancelPackage();
  const router = useRouter();
  const [savingCancelId, setSavingCancelId] = React.useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Load locations to map location IDs to names
  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locs = await getLocations();
        setLocations(locs);
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Helper to get location name by ID
  const getLocationName = (locationId: number | null) => {
    if (!locationId || !locations.length) return null;
    const sorted = [...locations]
      .filter((loc) => loc.createdAt)
      .sort(
        (a, b) =>
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
      );
    if (locationId > 0 && locationId <= sorted.length) {
      return sorted[locationId - 1]?.name;
    }
    return null;
  };

  const isDeliveredStatus = (status: unknown) => {
    const asNumber = typeof status === "number" ? status : Number(status as any);
    return asNumber === 2 || asNumber === 5;
  };

  const isInTransitStatus = (status: unknown) => {
    const asNumber = typeof status === "number" ? status : Number(status as any);
    return asNumber === 1;
  };

  let items = data?.items ?? [];
  const totalItems = (data as any)?.totalCount ?? items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Aplicar filtros
  items = items.filter((item: any) => {
    // Filtro de búsqueda
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (item.trackingNumber?.toLowerCase() || "").includes(searchLower) ||
      ((item as any).recipient?.name?.toLowerCase() || "").includes(
        searchLower,
      ) ||
      ((item as any).recipient?.address?.toLowerCase() || "").includes(
        searchLower,
      );

    // Filtro de estado
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "pending" && item.status === 0) ||
      (statusFilter === "in_transit" && item.status === 1) ||
      (statusFilter === "delivered" && item.status === 2);

    return matchesSearch && matchesStatus;
  });

  // Reset a página 1 cuando cambian filtros o itemsPerPage
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

  const newButton = (
    <Link
      href="/packages/new"
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap"
    >
      + New Package
    </Link>
  );

  return (
    <ListContainer
      filters={
        <FilterPackages
          onSearch={setSearchQuery}
          onStatusFilter={setStatusFilter}
          onDateFilter={(start, end) => {
            if (start) setDateStart(start);
            if (end) setDateEnd(end);
          }}
          onItemsPerPageChange={setItemsPerPage}
          newButton={newButton}
        />
      }
      isLoading={isLoading}
      error={error?.message ?? null}
      isEmpty={items.length === 0}
      emptyMessage="No packages available."
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: itemsPerPage,
        onPageChange: setCurrentPage,
      }}
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-8 py-3 text-sm font-semibold text-gray-700">
              Tracking
            </th>
            <th className="text-left px-8 py-3 text-sm font-semibold text-gray-700">
              Recipient
            </th>
            <th className="text-left px-8 py-3 text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="text-left pl-16 pr-8 py-3 text-sm font-semibold text-gray-700">
              Destination
            </th>
            <th className="text-left px-8 py-3 text-sm font-semibold text-gray-700">
              Created
            </th>
            <th className="text-left px-8 py-3 text-sm font-semibold text-gray-700">
              Last Updated
            </th>
            <th className="text-left px-10 py-3 text-sm font-semibold text-gray-700">
              Priority
            </th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, idx) => {
            const title = p.trackingNumber ?? "No description";
            const destination =
              (p as any).recipient?.address ?? p.destinationAddress ?? p.destination ?? "-";
            const recipientName = (p as any).recipient?.name ?? "-";

            return (
              <tr
                key={p.id}
                className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
              >
                <td className="px-8 py-4 font-medium text-gray-800">{title}</td>
                <td className="px-8 py-4 text-gray-600">{recipientName}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium w-fit ${getStatusBadgeClass(p.status)}`}
                    >
                      {getStatusLabel(p.status)}
                    </span>
                    {(p as any)?.currentLocationId && !isDeliveredStatus(p.status) && !isInTransitStatus(p.status) && (
                      <span className="text-xs text-gray-600">
                        {getLocationName((p as any).currentLocationId) ||
                          `Depot #${(p as any).currentLocationId}`}
                      </span>
                    )}
                  </div>
                </td>
                <td className="pl-16 pr-8 py-4 text-gray-600">{destination}</td>
                <td className="px-8 py-4 text-gray-600 text-sm">
                  {formatDate(p.createdAt)}
                </td>
                <td className="px-8 py-4 text-gray-600 text-sm">
                  {formatDate(p.lastUpdatedAt)}
                </td>
                <td className="px-8 py-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${getPriorityBadgeClass(p.priority)}`}
                  >
                    {getPriorityLabel(p.priority)}
                  </span>
                </td>
                <td className="px-3 py-4 space-x-2 flex">
                  <button
                    onClick={() => router.push(`/packages/${p.id}`)}
                    className="px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={async () => {
                      setSavingCancelId(p.id);
                      try {
                        await cancel.mutateAsync(p.id);
                      } catch (err: any) {
                        console.error(err?.message ?? "Error");
                      } finally {
                        setSavingCancelId(null);
                      }
                    }}
                    disabled={savingCancelId === p.id}
                    className="px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {savingCancelId === p.id ? "..." : "Cancel"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ListContainer>
  );
}
