"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function hasAdminRoleFromToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roles) return false;
    if (Array.isArray(roles)) return roles.includes('Admin');
    return String(roles).split(',').map(s => s.trim()).includes('Admin');
  } catch (e) {
    return false;
  }
}

export default function AuthGuard({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    if (requireAdmin) {
      if (!hasAdminRoleFromToken(token)) {
        router.replace('/');
        return;
      }
    }
    setChecking(false);
  }, [router, requireAdmin]);

  if (checking) return <div className="p-6">Comprobando autenticación...</div>;

  return <>{children}</>;
}
