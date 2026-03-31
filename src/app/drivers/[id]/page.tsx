import DriverDetail from '@/src/components/DriverDetail';
import React from 'react';


type Props = { params: { id: string } };

export default function DriverPage({ params }: Props) {
  return (
    <main className="container mx-auto p-6">
      <DriverDetail id={params.id} />
    </main>
  );
}
