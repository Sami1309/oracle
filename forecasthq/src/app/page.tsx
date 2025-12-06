'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MarketCard } from '@/components/markets/MarketCard';
import { DEMO_MARKETS } from '@/lib/seed-data';
import { ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredMarkets = selectedCategory === 'all'
    ? DEMO_MARKETS
    : DEMO_MARKETS.filter(m => m.category === selectedCategory);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Filters & Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex gap-1 bg-slate-100/80 p-1 rounded-lg">
              {['all', 'product', 'sales', 'competitor', 'hiring'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Analytics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
