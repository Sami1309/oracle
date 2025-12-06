'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MarketCard } from '@/components/markets/MarketCard';
import { DEMO_MARKETS } from '@/lib/seed-data';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredMarkets = selectedCategory === 'all'
    ? DEMO_MARKETS
    : DEMO_MARKETS.filter(m => m.category === selectedCategory);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Markets Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Markets</h1>
            <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg w-fit">
              {['all', 'product', 'sales', 'competitor', 'hiring'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
