import React from 'react';
import VehicleForm from '../../../components/VehicleForm';
import AuthGuard from '../../../components/AuthGuard';

export default function NewVehiclePage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-0">
        <VehicleForm />
      </main>
    </AuthGuard>
  );
}
