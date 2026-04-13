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
        <div className="text-red-600">Invalid driver ID</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DriverDetail id={id} />
    </AuthGuard>
  );
}
