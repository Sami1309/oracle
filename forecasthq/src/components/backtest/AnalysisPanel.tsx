'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Loader2, RefreshCw } from 'lucide-react';
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
        setError('Failed to generate analysis. Please try again.');
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
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">AI Analysis</h2>
                <p className="text-xs text-white/70">
                  {selectedTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' • '}{currentProb.toFixed(1)}% probability
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-sm text-rose-700">{error}</p>
              <button onClick={fetchAnalysis} className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </button>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold text-slate-800 mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-700 mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-600 leading-relaxed mb-3">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-1.5 mb-3 list-none pl-0">{children}</ul>,
                  li: ({ children }) => (
                    <li className="text-slate-600 flex items-start gap-2">
                      <span className="text-indigo-500 mt-1.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="flex gap-1 mb-3">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Analyzing forecast data...</span>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Select a point on the chart to analyze</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {analysis && !isLoading && (
          <div className="border-t border-slate-100 p-4 flex-shrink-0">
            <button
              onClick={fetchAnalysis}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors flex items-center justify-center gap-2"
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
