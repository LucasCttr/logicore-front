import React from 'react';
import DriverList from '../../components/DriverList';
import AuthGuard from '../../components/AuthGuard';

export default function DriversPage() {
  return (
    <AuthGuard>
      <DriverList />
    </AuthGuard>
  );
}
