import React from 'react';
import dynamic from 'next/dynamic';

const DriverList = dynamic(() => import('../../components/DriverList'), { ssr: false });

export default function DriversPage() {
  return (
    <main className="container mx-auto p-6">
      <DriverList />
    </main>
  );
}
