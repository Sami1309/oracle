'use client';

import { Bell, Search, ChevronDown, HelpCircle } from 'lucide-react';

interface HeaderProps {
  userBalance?: number;
}

export function Header({ userBalance = 1000 }: HeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 flex items-center justify-between sticky top-0 z-10 transition-all duration-200">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search markets, forecasts, or users..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-8">
        {/* Balance Display */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-full text-sm font-medium text-emerald-700 shadow-sm">
          <span className="text-emerald-500 font-normal">Balance:</span>
          <span>${userBalance.toLocaleString()}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-200" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* User Menu */}
        <div className="pl-2">
           <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-all border border-transparent hover:border-slate-200">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
              <span className="font-bold text-sm">DU</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-700 leading-none">Demo User</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">View Profile</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
