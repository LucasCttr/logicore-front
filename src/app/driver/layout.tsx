"use client";

import React from 'react';
import AuthGuard from '../../components/AuthGuard';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRoles="Driver">
      {children}
    </AuthGuard>
  );
}
