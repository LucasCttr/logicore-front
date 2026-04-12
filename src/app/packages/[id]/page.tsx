'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PackageDetail from '@/src/components/PackageDetail';
import AuthGuard from '@/src/components/AuthGuard';

export default function PackagePage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <AuthGuard>
        <main className="container mx-auto p-6">
          <div className="text-red-600">Invalid package ID</div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <PackageDetail id={id} />
      </main>
    </AuthGuard>
  );
}
