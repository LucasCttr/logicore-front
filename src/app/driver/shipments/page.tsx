"use client";

import React from 'react';
import AuthGuard from '../../../components/AuthGuard';
import ShipmentList from '../../../components/ShipmentList';

export default function DriverShipmentsPage() {
  return (
    <AuthGuard requireRoles="Driver">
      <ShipmentList />
    </AuthGuard>
  );
}
