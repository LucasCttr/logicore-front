"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getRolesFromToken(token: string): string[] {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    return String(roles).split(',').map((s: string) => s.trim());
  } catch (e) {
    return [];
  }
}

function hasRole(token: string, requiredRole: string | string[]): boolean {
  const roles = getRolesFromToken(token);
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.some(role => required.includes(role));
}

export default function AuthGuard({ children, requireRoles }: { children: React.ReactNode; requireRoles?: string | string[] }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    if (requireRoles) {
      if (!hasRole(token, requireRoles)) {
        router.replace('/');
        return;
      }
    }
    setChecking(false);
  }, [router, requireRoles]);

  if (checking) return <div className="p-6">Comprobando autenticación...</div>;

  return <>{children}</>;
}
