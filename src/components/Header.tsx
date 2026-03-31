"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname() || '/';
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      setToken(t);
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch (e) {
      setToken(null);
      setUser(null);
    }
  }, []);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/drivers', label: 'Drivers' },
    { href: '/packages', label: 'Packages' },
    { href: '/shipments', label: 'Shipments' },
    { href: '/locations', label: 'Locations' },
  ];

  return (
    <header className="w-full bg-white border-b">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="text-lg font-semibold">LogiCore</div>
        <div className="flex gap-2 items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded transition-colors ${pathname === l.href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {l.label}
            </Link>
          ))}
          {token ? (
            <>
              <Link href="/admin/users" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">Users</Link>
              <button
                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }}
                className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={`px-3 py-2 rounded transition-colors ${pathname === '/login' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Login</Link>
          )}
          {user?.name && <div className="ml-2 text-sm text-gray-600">{user.name}</div>}
        </div>
      </nav>
    </header>
  );
}
