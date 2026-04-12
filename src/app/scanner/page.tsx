"use client";

import React from 'react';
import AuthGuard from '../../components/AuthGuard';
import DepotIngressScanner from '../../components/DepotIngressScanner';

export default function ScannerPage() {
  return (
    <AuthGuard>
      <DepotIngressScanner />
    </AuthGuard>
  );
}
