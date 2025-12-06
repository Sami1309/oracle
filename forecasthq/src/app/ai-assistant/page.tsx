'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ForecastingAssistant } from '@/components/ai/ForecastingAssistant';
import { DEMO_MARKETS, getMarketById } from '@/lib/seed-data';
import { TrendingUp, ChevronDown, Loader2 } from 'lucide-react';

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const marketIdFromUrl = searchParams.get('market');

  const [selectedMarketId, setSelectedMarketId] = useState(
    marketIdFromUrl || DEMO_MARKETS[0].id
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedMarket = getMarketById(selectedMarketId) || DEMO_MARKETS[0];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Forecasting Assistant</h1>
        <p className="text-gray-500">Get help analyzing predictions with AI-powered insights</p>
      </div>

      {/* Market Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a market to analyze
        </label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedMarket.title}</p>
                <p className="text-sm text-gray-500">
                  {(selectedMarket.currentProbability * 100).toFixed(0)}% YES
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {DEMO_MARKETS.map((market) => (
                <button
                  key={market.id}
                  onClick={() => {
                    setSelectedMarketId(market.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left ${
                    market.id === selectedMarketId ? 'bg-purple-50' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      market.currentProbability > 0.5 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{market.title}</p>
                    <p className="text-xs text-gray-500">
                      {(market.currentProbability * 100).toFixed(0)}% YES - {market.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forecasting Assistant */}
      <ForecastingAssistant
        key={selectedMarketId}
        question={selectedMarket.title}
        currentProbability={selectedMarket.currentProbability}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <AIAssistantContent />
      </Suspense>
    </AppLayout>
  );
}
