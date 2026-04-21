"use client";

import React, { useEffect, useState } from 'react';
import DriverDashboard from '../components/DriverDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { getDriverById } from '../api/drivers';
import type { AssignedVehicleInfo } from '../types/drivers';

function getRolesFromToken(token: string): string[] {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    return String(roles).split(',').map((s: string) => s.trim());
  } catch (e) {
    return [];
  }
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
  } catch (e) {
    return null;
  }
}

export default function Dashboard() {
  const [roles, setRoles] = useState<string[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const extractedRoles = getRolesFromToken(token);
          setRoles(extractedRoles);

          // If user is a driver, fetch their vehicle info
          if (extractedRoles.includes('Driver')) {
            const userId = getUserIdFromToken(token);
            if (userId) {
              getDriverById(userId)
                .then(driver => {
                  if (driver?.assignedVehicle) {
                    setAssignedVehicle(driver.assignedVehicle);
                  }
                })
                .catch(err => console.error('Error fetching driver:', err))
                .finally(() => setIsLoading(false));
            } else {
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        setRoles([]);
        setIsLoading(false);
      }
    }
  }, []);

  const isDriver = roles.includes('Driver');
  const isAdmin = roles.includes('Admin');

  // For driver-only users, show the driver dashboard
  if (isDriver && !isAdmin) {
    return (
      <main className="w-full h-full">
        <DriverDashboard shipmentCount={0} vehicleAssigned={!!assignedVehicle} assignedVehicle={assignedVehicle} />
      </main>
    );
  }

  // For admin users, show the admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Default empty view for unauthenticated users
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Welcome to LogiCore</h1>
      <p className="text-gray-600 mt-4">Please log in to access the dashboard</p>
    </main>
  );
}