'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Brain,
  User,
  Layers,
  LogOut,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Derivatives', href: '/derivative', icon: Layers },
  { name: 'Create Market', href: '/admin', icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-slate-200/60 min-h-screen flex flex-col sticky top-0 h-screen z-20 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
      {/* Logo */}
      <div className="p-6 pb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-transform group-hover:scale-105 duration-300">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              ForecastHQ
            </span>
            <span className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider mt-1">
              Enterprise
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {navigation.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 transition-colors duration-200 ${
                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto space-y-4">
        {/* Profile Card */}
        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 group cursor-pointer">
          <Link href="/profile" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-white group-hover:scale-105 transition-transform duration-300">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Demo User</p>
              <p className="text-xs text-slate-500 truncate font-medium">$1,000.00 Balance</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Demo Notice */}
        <div className="px-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Environment</p>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed pl-4">
            Data resets periodically.
          </p>
        </div>
      </div>
    </aside>
  );
}
