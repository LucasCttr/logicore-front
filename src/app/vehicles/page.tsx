import React from 'react';
import VehicleList from '../../components/VehicleList';
import AuthGuard from '../../components/AuthGuard';

export default function VehiclesPage() {
  return (
    <AuthGuard>
      <VehicleList />
    </AuthGuard>
  );
}
