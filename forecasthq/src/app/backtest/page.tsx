'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { BacktestChart } from '@/components/backtest/BacktestChart';
import { AnalysisPanel } from '@/components/backtest/AnalysisPanel';
import { getMarketById } from '@/lib/seed-data';
import { getEventsForMarket, getMetricsForMarket, getMetricValueAtTime } from '@/lib/historical-events';
import { ArrowLeft, History, Sparkles, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';

function BacktestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const marketId = searchParams.get('market');

  const market = marketId ? getMarketById(marketId) : null;
  const events = marketId ? getEventsForMarket(marketId) : [];
  const metrics = marketId ? getMetricsForMarket(marketId) : [];

  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedProb, setSelectedProb] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Metrics at selected time
  const metricsAtTime = useMemo(() => {
    if (!selectedTime || !metrics.length) return [];
    return metrics.map(m => ({
      ...m,
      currentValue: getMetricValueAtTime(m, selectedTime) || 0,
    }));
  }, [selectedTime, metrics]);

  // Nearby events
  const nearbyEvents = useMemo(() => {
    if (!selectedTime) return events.slice(-5).reverse();
    return events.filter(e => {
      const diff = Math.abs(new Date(e.timestamp).getTime() - selectedTime.getTime());
      return diff < 1000 * 60 * 60 * 48;
    });
  }, [selectedTime, events]);

  const handleTimeSelect = (timestamp: Date, probability: number) => {
    setSelectedTime(timestamp);
    setSelectedProb(probability);
  };

  if (!market) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-slate-500">Market not found</p>
          <Link href="/markets" className="text-indigo-600 hover:underline mt-2 inline-block">Back to markets</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-3 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to market
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Backtest Analysis</h1>
                <p className="text-sm text-slate-500 max-w-lg truncate">{market.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content with chart and inline panels */}
        <div className="space-y-6">
          {/* Chart with integrated data display */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Chart header with current/selected state */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-500">
                  {selectedTime ? `Viewing: ${selectedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Current Forecast'}
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-bold text-slate-900">
                    {selectedProb !== null ? selectedProb.toFixed(1) : (market.currentProbability * 100).toFixed(1)}%
                  </span>
                  {selectedProb !== null && (
                    <span className={`flex items-center gap-1 text-sm font-medium ${selectedProb > market.currentProbability * 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedProb > market.currentProbability * 100 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {(selectedProb - market.currentProbability * 100).toFixed(1)}% vs now
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowAnalysis(true)}
                disabled={!selectedTime}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg text-sm font-medium text-white transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Analyze This Point
              </button>
            </div>

            {/* Chart */}
            <div className="p-6">
              <BacktestChart
                history={market.history}
                events={events}
                metrics={metrics}
                onTimeSelect={handleTimeSelect}
                onAnalyze={() => setShowAnalysis(true)}
                selectedTimestamp={selectedTime}
              />
            </div>

            {/* Data panels below chart */}
            <div className="grid grid-cols-2 border-t border-slate-100">
              {/* Metrics panel */}
              <div className="p-5 border-r border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                  {selectedTime ? 'Metrics at Selected Time' : 'Hover to See Metrics'}
                </h3>
                {metricsAtTime.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {metricsAtTime.map(m => (
                      <div key={m.id} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-0.5">{m.name}</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {m.currentValue.toLocaleString()}{m.unit && <span className="text-slate-400 text-sm ml-0.5">{m.unit}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Move your cursor over the chart to see internal company metrics at any point in time</p>
                )}
              </div>

              {/* Events panel */}
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                  {selectedTime ? 'Nearby Events' : 'Recent Events'}
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nearbyEvents.length > 0 ? nearbyEvents.slice(0, 4).map(event => (
                    <div key={event.id} className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        event.impact === 'positive' ? 'bg-emerald-500' : event.impact === 'negative' ? 'bg-rose-500' : 'bg-slate-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{event.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.category}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400">No events nearby</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Interactive Backtest</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Hover over the chart to explore internal company metrics and events at any point in history.
                  Click <strong>"Analyze This Point"</strong> to get AI-powered insights on what drove the forecast at that moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis panel */}
      <AnalysisPanel
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        marketId={market.id}
        marketTitle={market.title}
        marketDescription={market.description}
        selectedTime={selectedTime}
        currentProb={selectedProb || market.currentProbability * 100}
        events={events}
        metrics={metrics}
      />
    </AppLayout>
  );
}

function BacktestLoading() {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading backtest...</span>
        </div>
      </div>
    </AppLayout>
  );
}

export default function BacktestPage() {
  return (
    <Suspense fallback={<BacktestLoading />}>
      <BacktestContent />
    </Suspense>
  );
}
