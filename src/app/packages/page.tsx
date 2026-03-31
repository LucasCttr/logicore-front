import React from 'react';
import PackageList from '../../components/PackageList';
import AuthGuard from '../../components/AuthGuard';

export default function PackagesPage() {
  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        <PackageList />
      </main>
    </AuthGuard>
  );
}
