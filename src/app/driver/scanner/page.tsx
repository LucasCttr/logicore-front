"use client";

import React from 'react';
import AuthGuard from '../../../components/AuthGuard';
import DepotIngressScanner from '../../../components/DepotIngressScanner';

export default function DriverScannerPage() {
  return (
    <AuthGuard requireRoles="Driver">
      <div className="h-full">
        <DepotIngressScanner />
      </div>
    </AuthGuard>
  );
}
