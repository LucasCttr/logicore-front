'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import DriverDetail from '@/src/components/DriverDetail';
import AuthGuard from '@/src/components/AuthGuard';

export default function DriverPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <AuthGuard>
        <main className="container mx-auto p-6">
          <div className="text-red-600">Invalid driver ID</div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <DriverDetail id={id} />
      </main>
    </AuthGuard>
  );
}
