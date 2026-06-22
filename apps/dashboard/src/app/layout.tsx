import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Minimalist SaaS User Analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 overflow-hidden`}>
        <Providers>
          <div className="flex h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 overflow-auto p-6 md:p-10 relative">
                {/* Background decorative blob */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-50 via-white to-sky-50 -z-10 rounded-br-3xl opacity-50" />
                <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
