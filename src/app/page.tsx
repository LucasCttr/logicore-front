"use client";

import React, { useEffect, useState } from 'react';
import DriverDashboard from '../components/DriverDashboard';

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

export default function Home() {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const extractedRoles = getRolesFromToken(token);
          setRoles(extractedRoles);
        }
      } catch (e) {
        setRoles([]);
      }
    }
  }, []);

  const isDriver = roles.includes('Driver');
  const isAdmin = roles.includes('Admin');

  // For driver-only users, show the driver dashboard
  if (isDriver && !isAdmin) {
    return (
      <main className="w-full h-full">
        <DriverDashboard shipmentCount={0} vehicleAssigned={true} />
      </main>
    );
  }

  // Default admin view
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-primary">LogiCore Admin Dashboard</h1>
      <button className="btn btn-primary mt-4">This is a DaisyUI button</button>
      
      <div className="stats shadow mt-8 block">
        <div className="stat">
          <div className="stat-title">Total Shipments</div>
          <div className="stat-value text-primary">412</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </div>
    </main>
  );
}