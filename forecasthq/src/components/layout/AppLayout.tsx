'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen relative">
          <Header />
          <main className="flex-1 p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
