'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MarketCard } from '@/components/markets/MarketCard';
import { DEMO_MARKETS } from '@/lib/seed-data';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'volume' | 'traders' | 'closing'>('volume');

  let markets = [...DEMO_MARKETS];

  // Filter by category
  if (selectedCategory !== 'all') {
    markets = markets.filter((m) => m.category === selectedCategory);
  }

  // Filter by search
  if (searchQuery) {
    markets = markets.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  markets.sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.volume - a.volume;
      case 'traders':
        return b.traders - a.traders;
      case 'closing':
        return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Markets</h1>
            <p className="text-gray-500">Browse and trade on active predictions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'volume' | 'traders' | 'closing')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="volume">Sort by Volume</option>
              <option value="traders">Sort by Traders</option>
              <option value="closing">Sort by Closing Soon</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          {['all', 'product', 'sales', 'competitor', 'hiring'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-lg capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-2 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {markets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No markets found matching your criteria.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
