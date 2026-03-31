"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname() || '/';
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
        <div className="flex gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded transition-colors ${pathname === l.href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
