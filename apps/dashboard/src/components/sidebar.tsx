'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

export const navigationLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sessions', href: '/sessions', icon: Users },
  { name: 'Heatmap', href: '/heatmap', icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r bg-white/50 backdrop-blur-md">
      <div className="flex h-16 items-center px-6 font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Analytics SaaS
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-slate-100',
                isActive ? 'bg-slate-100 text-blue-700' : 'text-slate-600'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
