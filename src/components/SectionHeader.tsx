"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface SectionHeaderProps {
  title?: string;
  backHref?: string;
}

export default function SectionHeader({ title: customTitle, backHref }: SectionHeaderProps) {
  const pathname = usePathname() || '/';

  const getTitleFromPath = (path: string): string => {
    if (path === '/') return 'Home';
    if (path === '/drivers') return 'Drivers';
    if (path === '/packages') return 'Packages';
    if (path === '/scanner') return 'Scanner';
    if (path === '/shipments') return 'Shipments';
    if (path === '/vehicles') return 'Vehicles';
    if (path === '/locations') return 'Locations';
    if (path === '/users') return 'Users';
    if (path === '/admin/users') return 'Users';
    if (path === '/login') return 'Login';
    
    // Extraer nombre genérico de rutas dinámicas
    const parts = path.split('/').filter(p => p);
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    
    return 'Page';
  };

  const title = customTitle || getTitleFromPath(pathname);

  return (
    <header className="bg-blue-900 border-b border-gray-700 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="p-2 hover:bg-blue-800 rounded-lg transition"
            title="Go back"
          >
            <ChevronLeft size={20} className="text-white" />
          </Link>
        )}
        <h1 className="text-4xl font-light text-white tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
