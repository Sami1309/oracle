'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area } from 'recharts';

interface MarketCardProps {
  market: {
    id: string;
    title: string;
    category: string;
    currentProbability: number;
    volume: number;
    traders: number;
    closesAt: string;
    history: { timestamp: string; probability: number }[];
  };
}

const categoryColors: Record<string, string> = {
  product: 'text-blue-600 bg-blue-50/50 border-blue-200/50',
  sales: 'text-emerald-600 bg-emerald-50/50 border-emerald-200/50',
  competitor: 'text-amber-600 bg-amber-50/50 border-amber-200/50',
  hiring: 'text-purple-600 bg-purple-50/50 border-purple-200/50',
  fun: 'text-pink-600 bg-pink-50/50 border-pink-200/50',
};

export function MarketCard({ market }: MarketCardProps) {
  const daysLeft = Math.ceil(
    (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Simple trend calculation
  const trend = market.currentProbability > 0.5 ? 0.05 : -0.05;
  const isPositive = trend > 0;

  const chartData = market.history;

  return (
    <Link href={`/markets/${market.id}`} className="group block h-full">
      <div className="bg-white rounded-xl border border-slate-200/60 p-5 h-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 flex flex-col relative overflow-hidden group-hover:-translate-y-1">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4 z-10 relative">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColors[market.category] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            {market.category}
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {Math.abs(trend * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-6 leading-relaxed group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]">
          {market.title}
        </h3>

        {/* Main Content Area: Probability & Sparkline */}
        <div className="flex-1 flex flex-col justify-end relative z-10">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              {(market.currentProbability * 100).toFixed(0)}%
            </span>
            <span className="text-sm text-slate-500 font-medium">chance</span>
          </div>
          
          {/* Sparkline Container */}
          <div className="h-16 -mx-5 mb-4 relative opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 100]} hide />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  fill={`url(#color-${market.id})`}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" title="Traders">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{market.traders}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Time Remaining">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{daysLeft > 0 ? `${daysLeft}d` : 'Ended'}</span>
              </div>
            </div>
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">${(market.volume / 1000).toFixed(1)}k Vol</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
