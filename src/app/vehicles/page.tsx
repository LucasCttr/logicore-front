import React from 'react';
import VehicleList from '../../components/VehicleList';
import AuthGuard from '../../components/AuthGuard';

export default function VehiclesPage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <VehicleList />
      </main>
    </AuthGuard>
  );
}
