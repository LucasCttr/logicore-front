"use client";

import React, { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import DriverDashboard from '../../components/DriverDashboard';
import { getDriverById } from '../../api/drivers';
import type { AssignedVehicleInfo } from '../../types/drivers';

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
  } catch {
    return null;
  }
}

export default function DriverPage() {
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicleInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = getUserIdFromToken(token);
    if (!userId) return;

    getDriverById(userId)
      .then(driver => {
        if (driver?.assignedVehicle) {
          setAssignedVehicle(driver.assignedVehicle);
        }
      })
      .catch(err => console.error('Error fetching driver:', err));
  }, []);

  return (
    <AuthGuard requireRoles="Driver">
      <main className="w-full h-full">
        <DriverDashboard vehicleAssigned={!!assignedVehicle} assignedVehicle={assignedVehicle} />
      </main>
    </AuthGuard>
  );
}
