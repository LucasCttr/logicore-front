"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DriverPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to shipments on first visit
    router.replace('/driver/shipments');
  }, [router]);

  return null;
}
