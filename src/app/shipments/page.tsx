import React from 'react';
import ShipmentList from '../../components/ShipmentList';
import AuthGuard from '../../components/AuthGuard';

export default function ShipmentsPage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <ShipmentList />
      </main>
    </AuthGuard>
  );
}
