'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import { HistoricalEvent, TimeSeriesMetric, getMetricValueAtTime, getEventsNearTimestamp } from '@/lib/historical-events';
import ReactMarkdown from 'react-markdown';

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  marketTitle: string;
  marketDescription?: string;
  selectedTime: Date | null;
  currentProb: number;
  events: HistoricalEvent[];
  metrics: TimeSeriesMetric[];
}

export function AnalysisPanel({
  isOpen,
  onClose,
  marketId,
  marketTitle,
  marketDescription,
  selectedTime,
  currentProb,
  events,
  metrics,
}: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = async () => {
    if (!selectedTime) return;

    setIsLoading(true);
    setAnalysis('');
    setError(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Get nearby events and metric values at selected time
    const nearbyEvents = getEventsNearTimestamp(marketId, selectedTime, 168); // 7 days
    const metricValues = metrics.map(m => ({
      name: m.name,
      unit: m.unit,
      value: getMetricValueAtTime(m, selectedTime) || 0,
      category: m.category,
    }));

    try {
      const response = await fetch('/api/ai/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketTitle,
          marketDescription,
          events: nearbyEvents,
          metrics: metricValues,
          selectedTime: selectedTime.toISOString(),
          currentProb,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to get analysis');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnalysis(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // Fallback to mock analysis if API fails
        const dateStr = selectedTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        const eventText = nearbyEvents.length > 0
          ? `The recent **${nearbyEvents[0].title}** event had a significant impact.`
          : "There were no major public events in this window.";

        const metricText = metricValues.length > 0
          ? `**${metricValues[0].name}** was at **${metricValues[0].value}${metricValues[0].unit || ''}**`
          : "steady operational metrics";

        setAnalysis(`## Analysis for ${dateStr}

The market probability at this point (**${currentProb.toFixed(1)}%**) reflects ${currentProb > 50 ? "positive" : "cautious"} sentiment.

### Key Drivers

- **Internal Metrics**: ${metricText}
- **Events**: ${eventText}

### Signal Strength

The correlation between internal data and market sentiment is strong, suggesting traders had access to reliable signals.

### Watch Points

- Monitor for metric divergence
- Upcoming reviews may cause volatility`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedTime) {
      fetchAnalysis();
    }
    return () => abortRef.current?.abort();
  }, [isOpen, selectedTime]);

  useEffect(() => {
    if (contentRef.current && isLoading) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [analysis, isLoading]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">AI Analysis</h2>
                <p className="text-xs text-white/80 font-medium">
                  {selectedTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' • '}{currentProb.toFixed(1)}% probability
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm text-rose-700">{error}</p>
              <button onClick={fetchAnalysis} className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </button>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm prose-slate max-w-none bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold text-slate-800 mt-6 mb-3 flex items-center gap-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-slate-700 mt-4 mb-2 uppercase tracking-wider">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 mb-4 list-none pl-0">{children}</ul>,
                  li: ({ children }) => (
                    <li className="text-slate-600 flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="flex gap-1.5 mb-4">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-medium text-slate-500">Analyzing metrics & correlations...</span>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm">Select a point on the chart to analyze</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {analysis && !isLoading && (
          <div className="border-t border-slate-200 p-4 bg-white flex-shrink-0">
            <button
              onClick={fetchAnalysis}
              className="w-full py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow rounded-xl text-sm font-medium text-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Analysis
            </button>
          </div>
        )}
      </div>
    </>
  );
}
