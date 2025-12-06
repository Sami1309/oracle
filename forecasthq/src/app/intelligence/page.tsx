'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DEMO_MARKETS, getMarketById } from '@/lib/seed-data';
import { searchDataPoints, DataPoint, DATA_POINT_CATEGORIES, AVAILABLE_DATA_POINTS } from '@/lib/data-points';
import { Brain, Search, X, Plus, Loader2, TrendingUp, Lightbulb, ChevronDown } from 'lucide-react';

interface SelectedDataPoint extends DataPoint {
  value: string;
}

function IntelligenceContent() {
  const searchParams = useSearchParams();
  const marketIdFromUrl = searchParams.get('market');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DataPoint[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDataPoints, setSelectedDataPoints] = useState<SelectedDataPoint[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState(marketIdFromUrl || '');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'analyze' | 'create-market'>('analyze');
  const [marketSuggestions, setMarketSuggestions] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSearchResults(searchDataPoints(searchQuery));
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addDataPoint = (dp: DataPoint) => {
    if (!selectedDataPoints.find((s) => s.id === dp.id)) {
      setSelectedDataPoints([
        ...selectedDataPoints,
        { ...dp, value: dp.sampleValue || '' },
      ]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeDataPoint = (id: string) => {
    setSelectedDataPoints(selectedDataPoints.filter((dp) => dp.id !== id));
  };

  const updateDataPointValue = (id: string, value: string) => {
    setSelectedDataPoints(
      selectedDataPoints.map((dp) =>
        dp.id === id ? { ...dp, value } : dp
      )
    );
  };

  const runAnalysis = async () => {
    if (selectedDataPoints.length === 0) return;

    setLoading(true);
    setAnalysis('');
    setMarketSuggestions([]);

    try {
      const market = selectedMarketId ? getMarketById(selectedMarketId) : null;
      const res = await fetch('/api/ai/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataPoints: selectedDataPoints.map((dp) => ({
            label: dp.label,
            value: dp.value,
          })),
          marketQuestion: market?.title || 'General business outcome analysis',
          mode,
        }),
      });
      const data = await res.json();

      if (mode === 'analyze') {
        setAnalysis(data.analysis);
      } else {
        setMarketSuggestions(data.suggestions || []);
        setAnalysis(data.raw || '');
      }
    } catch (e) {
      console.error(e);
      setAnalysis('Error running analysis. Please try again.');
    }
    setLoading(false);
  };

  const selectedMarket = selectedMarketId ? getMarketById(selectedMarketId) : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Brain className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Intelligence</h1>
        </div>
        <p className="text-gray-500">
          Aggregate data points to inform predictions or generate market questions.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Data Input */}
        <div className="col-span-2 space-y-4">
          {/* Mode Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('analyze')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'analyze'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline-block mr-2" />
                Analyze for Prediction
              </button>
              <button
                onClick={() => setMode('create-market')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'create-market'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Lightbulb className="w-4 h-4 inline-block mr-2" />
                Generate Market Ideas
              </button>
            </div>
          </div>

          {/* Market Selector (for analyze mode) */}
          {mode === 'analyze' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market to Analyze (optional)
              </label>
              <select
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">General analysis</option>
                {DEMO_MARKETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              {selectedMarket && (
                <p className="mt-2 text-sm text-gray-500">
                  Current probability: {(selectedMarket.currentProbability * 100).toFixed(0)}%
                </p>
              )}
            </div>
          )}

          {/* Data Point Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Data Points
            </label>
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  placeholder="Search for data points (e.g., 'sprint velocity', 'ARR', 'headcount')"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map((dp) => (
                    <button
                      key={dp.id}
                      onClick={() => addDataPoint(dp)}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{dp.label}</p>
                          <p className="text-xs text-gray-500">{dp.description}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {dp.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Categories */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Quick add by category:</p>
              <div className="flex flex-wrap gap-2">
                {DATA_POINT_CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchQuery(cat)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Data Points */}
          {selectedDataPoints.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Data Points ({selectedDataPoints.length})
              </h3>
              <div className="space-y-3">
                {selectedDataPoints.map((dp) => (
                  <div
                    key={dp.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{dp.label}</p>
                      <p className="text-xs text-gray-500">{dp.category}</p>
                    </div>
                    <input
                      type="text"
                      value={dp.value}
                      onChange={(e) => updateDataPointValue(dp.id, e.target.value)}
                      placeholder="Enter value"
                      className="w-32 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeDataPoint(dp.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={runAnalysis}
                disabled={loading || selectedDataPoints.length === 0}
                className="mt-4 w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    {mode === 'analyze' ? 'Run Analysis' : 'Generate Market Ideas'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* Analysis Result */}
          {analysis && mode === 'analyze' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-600" />
                Analysis
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </p>
              </div>
            </div>
          )}

          {/* Market Suggestions */}
          {marketSuggestions.length > 0 && mode === 'create-market' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Market Suggestions
              </h3>
              <div className="space-y-4">
                {marketSuggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="font-medium text-gray-900 text-sm mb-2">{suggestion.question}</p>
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Resolution:</span> {suggestion.resolution_criteria}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Closes:</span> {suggestion.closing_date}
                    </p>
                    <p className="text-xs text-gray-500">{suggestion.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analysis && selectedDataPoints.length === 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
              <Brain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Add data points to get AI-powered analysis for your predictions.
              </p>
            </div>
          )}

          {/* How it Works */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 p-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">How it works</h4>
            <ol className="text-xs text-gray-600 space-y-1.5">
              <li>1. Search and add relevant data points</li>
              <li>2. Enter current values for each metric</li>
              <li>3. Select a market or generate new ideas</li>
              <li>4. Get AI analysis to inform your prediction</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingFallback />}>
        <IntelligenceContent />
      </Suspense>
    </AppLayout>
  );
}
