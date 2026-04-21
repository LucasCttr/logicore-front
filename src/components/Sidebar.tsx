"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Users, Package, Scan, Truck, Car, MapPin, BoxesIcon, LogOut, User } from 'lucide-react';

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

export default function Sidebar() {
  const pathname = usePathname() || '/';
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const read = () => {
      if (typeof window !== 'undefined') {
        try {
          const t = localStorage.getItem('token');
          setToken(t);
          const u = localStorage.getItem('user');
          if (u) setUser(JSON.parse(u));
          else setUser(null);
        } catch (e) {
          setToken(null);
          setUser(null);
        }
      }
    };

    read();

    const onStorage = () => read();
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Extract roles from JWT token for accurate role checking
  const roles = token ? getRolesFromToken(token) : [];
  const isDriver = roles.includes('Driver');
  const isAdmin = roles.includes('Admin');
  const isAuthenticated = !!token;

  // Show different links based on user role
  let links: any[] = [];

  // Only show Home and other links if authenticated
  if (isAuthenticated) {
    if (isDriver) {
      // Driver-only view: shipments, scanner, profile
      links = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/driver/shipments', label: 'My Shipments', icon: Truck },
        { href: '/driver/scanner', label: 'Scanner', icon: Scan },
        { href: '/driver/profile', label: 'My Profile', icon: User }
      ];
    } else if (isAdmin) {
      // Admin-only full management
      links = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/drivers', label: 'Drivers', icon: Users },
        { href: '/packages', label: 'Packages', icon: Package },
        { href: '/scanner', label: 'Scanner', icon: Scan },
        { href: '/shipments', label: 'Shipments', icon: Truck },
        { href: '/vehicles', label: 'Vehicles', icon: Car },
        { href: '/locations', label: 'Locations', icon: MapPin },
        { href: '/users', label: 'Users', icon: User },
      ];
    } else {
      // Default authenticated user (no specific role)
      links = [
        { href: '/', label: 'Dashboard', icon: Home },
      ];
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <aside className="w-68 bg-gray-800 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-10 border-b border-gray-700 flex flex-col items-center justify-center">
        <BoxesIcon size={40} className="text-blue-400 mb-3" />
        <Link href="/" className="text-3xl font-light text-white hover:text-gray-300 transition-colors tracking-tight text-center">
          LogiCore
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`block px-4 py-4 rounded-r-lg transition-all duration-200 text-xl font-light flex items-center gap-7 tracking-tight ${
                  pathname === l.href
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500/30 text-white font-medium border-l-4 border-blue-400 pl-3 shadow-lg shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                }`}
              >
                <l.icon size={24} className="flex-shrink-0" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-700 p-4">
        {user && token && (
          <div className="mb-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-4 border border-blue-700/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                {user.name && (
                  <div className="text-sm font-light text-white truncate">
                    {user.name}
                  </div>
                )}
                {user?.email && (
                  <div className="text-xs text-blue-300 truncate">
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {token ? (
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className={`block w-full text-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 ${
              pathname === '/login'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-700 text-slate-300 hover:bg-gray-600 hover:text-white hover:shadow-lg'
            }`}
          >
            <User size={16} />
            Login
          </Link>
        )}
      </div>
    </aside>
  );
}
