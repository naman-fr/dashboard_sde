'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { navigationLinks } from './sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:px-6 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation for the application</SheetDescription>
            <div className="flex h-16 items-center px-6 font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent border-b">
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
                    onClick={() => setOpen(false)}
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
          </SheetContent>
        </Sheet>
        <h1 className="text-sm font-medium text-slate-800">Project Demo</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* User profile */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-sm" />
      </div>
    </header>
  );
}
