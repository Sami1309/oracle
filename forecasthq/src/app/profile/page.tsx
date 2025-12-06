'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { getCurrentUser, getUserPositions, Position } from '@/lib/users-data';
import { getMarketById } from '@/lib/seed-data';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const user = getCurrentUser();
  const positions = getUserPositions();

  // Calculate stats
  const totalInvested = positions.reduce((sum, p) => sum + (p.shares * p.avgPrice), 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0);
  const winRate = 75; // Demo value

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.role} • {user.department}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-600">Top 15% Forecaster</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-gray-900">${user.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Invested"
            value={`$${totalInvested.toFixed(0)}`}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Current Value"
            value={`$${totalCurrentValue.toFixed(0)}`}
            color="emerald"
          />
          <StatCard
            icon={totalProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            label="Total P&L"
            value={`${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`}
            color={totalProfit >= 0 ? 'emerald' : 'rose'}
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Win Rate"
            value={`${winRate}%`}
            color="purple"
          />
        </div>

        {/* Active Positions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Positions</h2>
            <p className="text-sm text-gray-500 mt-0.5">{positions.length} open positions</p>
          </div>

          <div className="divide-y divide-gray-50">
            {positions.map((position) => (
              <PositionRow key={position.id} position={position} />
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Forecasting Performance</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Brier Score</p>
              <p className="text-2xl font-bold text-gray-900">0.18</p>
              <p className="text-xs text-emerald-600 mt-1">Better than 85% of users</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Markets Participated</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-xs text-gray-500 mt-1">Since joining</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved Correctly</p>
              <p className="text-2xl font-bold text-gray-900">18/24</p>
              <p className="text-xs text-gray-500 mt-1">75% accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PositionRow({ position }: { position: Position }) {
  const market = getMarketById(position.marketId);
  const isProfit = position.profit >= 0;

  return (
    <Link href={`/markets/${position.marketId}`} className="block hover:bg-gray-50 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                position.position === 'yes'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {position.position.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {position.shares} shares @ ${position.avgPrice.toFixed(2)}
              </span>
            </div>
            <p className="font-medium text-gray-900 text-sm truncate">{position.marketTitle}</p>
            {market && (
              <p className="text-xs text-gray-500 mt-1">
                Current: {(market.currentProbability * 100).toFixed(0)}% • Closes {new Date(market.closesAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-gray-900">${position.currentValue.toFixed(2)}</p>
            <p className={`text-sm font-medium ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isProfit ? '+' : ''}{position.profit.toFixed(2)} ({isProfit ? '+' : ''}{((position.profit / (position.shares * position.avgPrice)) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
