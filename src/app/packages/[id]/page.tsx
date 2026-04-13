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
        <div className="text-red-600">Invalid package ID</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PackageDetail id={id} />
    </AuthGuard>
  );
}
