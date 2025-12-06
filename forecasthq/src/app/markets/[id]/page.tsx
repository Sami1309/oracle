'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { TradingPanel } from '@/components/markets/TradingPanel';
import { ProbabilityChart } from '@/components/markets/ProbabilityChart';
import { DiscussionThread } from '@/components/markets/DiscussionThread';
import { getMarketById } from '@/lib/seed-data';
import { ArrowLeft, Clock, Users, Calendar, User, Sparkles, Layers, History, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  product: 'text-blue-600 bg-blue-50 border-blue-200/50',
  sales: 'text-emerald-600 bg-emerald-50 border-emerald-200/50',
  competitor: 'text-amber-600 bg-amber-50 border-amber-200/50',
  hiring: 'text-purple-600 bg-purple-50 border-purple-200/50',
  fun: 'text-pink-600 bg-pink-50 border-pink-200/50',
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
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="text-slate-500 mb-4">Market not found</p>
          <Link href="/markets" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
      <div className="space-y-4">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-24 right-8 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/10 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-emerald-100 p-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Trade Executed</p>
              <p className="text-xs text-emerald-600/80">Your position has been updated.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Combined Header & Probability Card */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
              
              {/* Top Row: Back link & Meta */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColors[market.category]}`}>
                      {market.category}
                    </span>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Closed'}
                    </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                 <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{market.title}</h1>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{market.description}</p>
                 </div>
                 
                 {/* Probability Display - Compact */}
                 <div className="shrink-0 min-w-[200px]">
                    <div className="flex items-baseline justify-end gap-2 mb-2">
                       <span className="text-3xl font-bold text-slate-900 tracking-tight">
                         {(market.currentProbability * 100).toFixed(0)}%
                       </span>
                       <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Probability</span>
                    </div>
                     <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${market.currentProbability * 100}%` }}
                      />
                    </div>
                     <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-600">YES {(market.currentProbability * 100).toFixed(0)}%</span>
                      <span className="text-rose-500">NO {((1 - market.currentProbability) * 100).toFixed(0)}%</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Probability Chart */}
            <ProbabilityChart history={market.history} />

            {/* Market Details - Compact Grid */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Traders</p>
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                       <Users className="w-3.5 h-3.5 text-slate-400" />
                       {market.traders}
                    </p>
                </div>
                 <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Closes</p>
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                       <Calendar className="w-3.5 h-3.5 text-slate-400" />
                       {new Date(market.closesAt).toLocaleDateString()}
                    </p>
                </div>
                 <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Author</p>
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                       <User className="w-3.5 h-3.5 text-slate-400" />
                       {market.createdBy}
                    </p>
                </div>
                 <div className="space-y-1">
                    <p className="text-slate-400 font-medium">Volume</p>
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                       <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-slate-400">$</span>
                       ${market.volume.toLocaleString()}
                    </p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-3">
                 <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">Resolution:</span>
                 <p className="text-slate-600 text-xs leading-relaxed">{market.resolutionCriteria}</p>
              </div>
            </div>

            {/* Discussion Thread */}
            <DiscussionThread marketId={market.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="sticky top-24 space-y-4">
              <TradingPanel
                market={market}
                userBalance={userBalance}
                onTrade={handleTrade}
              />

              {/* Action Cards - Condensed */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/backtest?market=${market.id}`}
                  className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200/60 hover:border-indigo-500/30 hover:bg-indigo-50/10 hover:shadow-sm transition-all text-center gap-2 group"
                >
                  <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                     <History className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Backtest</span>
                </Link>

                <Link
                  href={`/derivative?market=${market.id}`}
                  className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200/60 hover:border-violet-500/30 hover:bg-violet-50/10 hover:shadow-sm transition-all text-center gap-2 group"
                >
                   <div className="p-1.5 bg-violet-50 rounded-lg group-hover:bg-violet-100 transition-colors">
                      <Layers className="w-4 h-4 text-violet-600" />
                   </div>
                   <span className="text-xs font-semibold text-slate-700">Derivative</span>
                </Link>
              </div>
              
              <Link
                  href={`/ai-assistant?market=${market.id}`}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all group"
                >
                   <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <div>
                      <div className="text-xs font-bold">AI Assistant</div>
                      <div className="text-[10px] text-indigo-100/80">Get instant analysis</div>
                   </div>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
