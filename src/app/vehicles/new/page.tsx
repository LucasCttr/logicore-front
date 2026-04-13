import React from 'react';
import VehicleForm from '../../../components/VehicleForm';
import AuthGuard from '../../../components/AuthGuard';

export default function NewVehiclePage() {
  return (
    <AuthGuard>
      <VehicleForm />
    </AuthGuard>
  );
}
