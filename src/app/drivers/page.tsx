import React from 'react';
import DriverList from '../../components/DriverList';
import AuthGuard from '../../components/AuthGuard';

export default function DriversPage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-0">
        <DriverList />
      </main>
    </AuthGuard>
  );
}
