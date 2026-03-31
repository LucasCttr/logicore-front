import React from 'react';
import LocationList from '../../components/LocationList';
import AuthGuard from '../../components/AuthGuard';

export default function LocationsPage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <LocationList />
      </main>
    </AuthGuard>
  );
}
