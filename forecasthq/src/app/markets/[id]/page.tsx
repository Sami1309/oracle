'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { TradingPanel } from '@/components/markets/TradingPanel';
import { ProbabilityChart } from '@/components/markets/ProbabilityChart';
import { DiscussionThread } from '@/components/markets/DiscussionThread';
import { getMarketById } from '@/lib/seed-data';
import { ArrowLeft, Clock, Users, Calendar, User, Sparkles, Brain, Layers } from 'lucide-react';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  product: 'text-blue-600 bg-blue-50 border-blue-100',
  sales: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  competitor: 'text-amber-600 bg-amber-50 border-amber-100',
  hiring: 'text-purple-600 bg-purple-50 border-purple-100',
  fun: 'text-pink-600 bg-pink-50 border-pink-100',
};

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const market = getMarketById(params.id as string);
  const [userBalance, setUserBalance] = useState(1000);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!market) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-gray-500">Market not found</p>
          <Link href="/markets" className="text-indigo-600 hover:underline mt-2 inline-block">
            Back to markets
          </Link>
        </div>
      </AppLayout>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleTrade = (position: boolean, amount: number, shares: number) => {
    setUserBalance((prev) => prev - amount);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 right-8 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Trade placed successfully!
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to markets
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${categoryColors[market.category]}`}>
                  {market.category}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Closed'}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{market.title}</h1>
              <p className="text-gray-600">{market.description}</p>
            </div>

            {/* Current Probability */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-sm">Current Probability</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">
                    {(market.currentProbability * 100).toFixed(0)}%
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">chance</span>
                </div>
              </div>
              <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${market.currentProbability * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-emerald-600 font-medium">YES {(market.currentProbability * 100).toFixed(0)}%</span>
                <span className="text-rose-600 font-medium">NO {((1 - market.currentProbability) * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Probability Chart */}
            <ProbabilityChart history={market.history} />

            {/* Market Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Market Details</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Traders</p>
                    <p className="font-medium text-gray-900">{market.traders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Closes</p>
                    <p className="font-medium text-gray-900">{new Date(market.closesAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Created By</p>
                    <p className="font-medium text-gray-900">{market.createdBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-gray-400">$</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Volume</p>
                    <p className="font-medium text-gray-900">${market.volume.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <p className="text-gray-500 text-xs mb-1">Resolution Criteria</p>
                <p className="text-gray-700 text-sm">{market.resolutionCriteria}</p>
              </div>
            </div>

            {/* Discussion Thread */}
            <DiscussionThread marketId={market.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TradingPanel
              market={market}
              userBalance={userBalance}
              onTrade={handleTrade}
            />

            {/* AI Intelligence Link */}
            <Link
              href={`/intelligence?market=${market.id}`}
              className="block bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Brain className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Intelligence</h3>
              </div>
              <p className="text-sm text-gray-600">
                Analyze data points to inform your prediction.
              </p>
            </Link>

            {/* Derivative Market Link */}
            <Link
              href={`/derivative?market=${market.id}`}
              className="block bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-5 border border-violet-100 hover:border-violet-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Create Derivative</h3>
              </div>
              <p className="text-sm text-gray-600">
                Combine with other markets for complex bets.
              </p>
            </Link>

            {/* AI Assistant Link */}
            <Link
              href={`/ai-assistant?market=${market.id}`}
              className="block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Forecasting Assistant</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get help analyzing this prediction with AI.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
