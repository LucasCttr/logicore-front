import { useState, useEffect } from 'react';

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

export function useCurrentUserRole(): string | null {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      setRole(null);
      return;
    }
    const roles = getRolesFromToken(token);
    setRole(roles.length > 0 ? roles[0] : null);
  }, []);

  return role;
}

export function useHasRole(requiredRole: string | string[]): boolean {
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      setHasRole(false);
      return;
    }
    try {
      const roles = getRolesFromToken(token);
      const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      setHasRole(roles.some(role => required.includes(role)));
    } catch (e) {
      setHasRole(false);
    }
  }, [requiredRole]);

  return hasRole;
}
