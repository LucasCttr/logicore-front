import PackageDetail from '@/src/components/PackageDetail';
import React from 'react';


type Props = { params: { id: string } };

export default function PackagePage({ params }: Props) {
  return (
    <main className="container mx-auto p-6">
      <PackageDetail id={params.id} />
    </main>
  );
}
