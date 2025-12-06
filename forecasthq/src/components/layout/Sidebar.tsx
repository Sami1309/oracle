'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Brain,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Intelligence', href: '/intelligence', icon: Brain },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { name: 'Create Market', href: '/admin', icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            ForecastHQ
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navigation.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Link */}
      <div className="px-3 mb-2">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            pathname === '/profile'
              ? 'bg-gray-100 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <span>Demo User</span>
            <span className="block text-xs text-gray-400">$1,000 balance</span>
          </div>
        </Link>
      </div>

      {/* Footer / Demo Notice */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs font-semibold text-gray-900">Demo Environment</p>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Data resets periodically. Play money only.
          </p>
        </div>
      </div>
    </aside>
  );
}
