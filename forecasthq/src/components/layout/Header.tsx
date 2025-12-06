'use client';

import { Bell, User } from 'lucide-react';

interface HeaderProps {
  userBalance?: number;
}

export function Header({ userBalance = 1000 }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div />

      <div className="flex items-center gap-6">
        <div className="text-sm font-medium">
          <span className="text-gray-500">Available Balance:</span>
          <span className="ml-2 text-gray-900">${userBalance.toLocaleString()}</span>
        </div>
        
        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2"></span>
          </button>
          
          <button className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-2 rounded-md transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">Demo User</span>
          </button>
        </div>
      </div>
    </header>
  );
}
