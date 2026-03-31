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
    const read = () => {
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
    };

    // read on mount and whenever pathname changes
    read();

    // update when other tabs modify storage
    const onStorage = () => read();
    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/drivers', label: 'Drivers' },
    { href: '/packages', label: 'Packages' },
    { href: '/shipments', label: 'Shipments' },
    { href: '/locations', label: 'Locations' },
  ];

  return (
    <header className="w-full bg-blue-800">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-white">
            <Link href="/">LogiCore</Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center gap-2 items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded transition-colors ${pathname === l.href ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-blue-700 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
          {token && (
            <Link href="/admin/users" className={`px-3 py-2 rounded transition-colors ${pathname === '/admin/users' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-blue-700 hover:text-white'}`}>Users</Link>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {user?.name && <div className="mr-2 text-sm text-slate-200">{user.name}</div>}
          {token ? (
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }}
              className="px-3 py-2 rounded text-slate-200 hover:bg-blue-700 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className={`px-3 py-2 rounded transition-colors ${pathname === '/login' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-blue-700 hover:text-white'}`}>Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
