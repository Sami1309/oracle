'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

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
  product: 'text-blue-600 bg-blue-50 border-blue-100',
  sales: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  competitor: 'text-amber-600 bg-amber-50 border-amber-100',
  hiring: 'text-purple-600 bg-purple-50 border-purple-100',
  fun: 'text-pink-600 bg-pink-50 border-pink-100',
};

export function MarketCard({ market }: MarketCardProps) {
  const daysLeft = Math.ceil(
    (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Simple trend calculation
  const trend = market.currentProbability > 0.5 ? 0.05 : -0.05;
  const isPositive = trend > 0;

  // Prepare data for the sparkline
  // We want a clean line, so we can stick to just probability
  const chartData = market.history;

  return (
    <Link href={`/markets/${market.id}`} className="group block h-full">
      <div className="bg-white rounded-lg border border-gray-200 p-5 h-full transition-all duration-200 hover:shadow-md hover:border-indigo-300 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3 z-10 relative">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${categoryColors[market.category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
            {market.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-medium bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              {Math.abs(trend * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 mb-4 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 z-10 relative">
          {market.title}
        </h3>

        {/* Main Content Area: Probability & Sparkline */}
        <div className="flex-1 flex flex-col justify-end relative z-10">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {(market.currentProbability * 100).toFixed(0)}%
            </span>
            <span className="text-sm text-gray-500 font-medium">chance</span>
          </div>
          
          {/* Sparkline Container */}
          <div className="h-16 -mx-2 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={[0, 100]} hide />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke={isPositive ? '#10b981' : '#f43f5e'} // emerald-500 or rose-500
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span>{market.traders}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{daysLeft > 0 ? `${daysLeft}d` : 'Ended'}</span>
              </div>
            </div>
            <span className="font-medium text-gray-700">${(market.volume / 1000).toFixed(1)}k Vol</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
