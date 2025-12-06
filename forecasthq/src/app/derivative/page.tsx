'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { DEMO_MARKETS } from '@/lib/seed-data';
import {
  Layers,
  Plus,
  X,
  Sparkles,
  Send,
  TrendingUp,
  ArrowRight,
  Check,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SelectedMarket {
  id: string;
  title: string;
  probability: number;
  position?: 'yes' | 'no';
}

interface DerivativeIdea {
  title: string;
  description: string;
  probability: number;
  markets: string[];
  condition: 'AND' | 'OR' | 'CONDITIONAL';
}

function DerivativeContent() {
  const searchParams = useSearchParams();
  const initialMarketId = searchParams.get('market');

  const [selectedMarkets, setSelectedMarkets] = useState<SelectedMarket[]>(() => {
    if (initialMarketId) {
      const market = DEMO_MARKETS.find(m => m.id === initialMarketId);
      if (market) {
        return [{ id: market.id, title: market.title, probability: market.currentProbability }];
      }
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showMarketPicker, setShowMarketPicker] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedDerivatives, setGeneratedDerivatives] = useState<DerivativeIdea[]>([]);
  const [selectedDerivative, setSelectedDerivative] = useState<DerivativeIdea | null>(null);
  const [betAmount, setBetAmount] = useState(50);

  const responseRef = useRef<HTMLDivElement>(null);

  const filteredMarkets = DEMO_MARKETS.filter(m =>
    !selectedMarkets.find(s => s.id === m.id) &&
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMarket = (market: typeof DEMO_MARKETS[0]) => {
    setSelectedMarkets(prev => [
      ...prev,
      { id: market.id, title: market.title, probability: market.currentProbability }
    ]);
    setSearchQuery('');
    setShowMarketPicker(false);
  };

  const removeMarket = (id: string) => {
    setSelectedMarkets(prev => prev.filter(m => m.id !== id));
  };

  const togglePosition = (id: string) => {
    setSelectedMarkets(prev => prev.map(m => {
      if (m.id === id) {
        const positions: (undefined | 'yes' | 'no')[] = [undefined, 'yes', 'no'];
        const currentIndex = positions.indexOf(m.position);
        return { ...m, position: positions[(currentIndex + 1) % 3] };
      }
      return m;
    }));
  };

  const analyzeWithAI = async () => {
    if (selectedMarkets.length < 2) return;

    setIsStreaming(true);
    setAiResponse('');
    setGeneratedDerivatives([]);

    try {
      const response = await fetch('/api/ai/derivative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedMarkets, userQuery }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        fullText += text;
        setAiResponse(fullText);

        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
      }

      // Parse derivatives from AI response
      parseDerivatives(fullText);
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Failed to analyze markets. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const parseDerivatives = (text: string) => {
    // Simple parsing - in production you'd want structured output
    const derivatives: DerivativeIdea[] = [];

    // Look for patterns like "**Title**" or numbered items
    const titleMatches = text.match(/\*\*([^*]+)\*\*/g);
    if (titleMatches && titleMatches.length >= 2) {
      // Create sample derivatives based on selected markets
      const m1 = selectedMarkets[0];
      const m2 = selectedMarkets[1];

      // AND derivative
      derivatives.push({
        title: `Both: ${m1.title.slice(0, 30)}... AND ${m2.title.slice(0, 30)}...`,
        description: 'Both outcomes must occur for payout',
        probability: m1.probability * m2.probability,
        markets: [m1.id, m2.id],
        condition: 'AND'
      });

      // OR derivative
      derivatives.push({
        title: `Either: ${m1.title.slice(0, 30)}... OR ${m2.title.slice(0, 30)}...`,
        description: 'Either outcome results in payout',
        probability: m1.probability + m2.probability - (m1.probability * m2.probability),
        markets: [m1.id, m2.id],
        condition: 'OR'
      });
    }

    setGeneratedDerivatives(derivatives);
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [aiResponse]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Derivative Markets</h1>
        </div>
        <p className="text-gray-600">
          Combine multiple predictions into a single derivative bet with AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Panel - Market Selection */}
        <div className="col-span-2 space-y-6">
          {/* Selected Markets */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Selected Markets</h2>
              <span className="text-sm text-gray-500">{selectedMarkets.length} selected</span>
            </div>

            <div className="space-y-3 mb-4">
              {selectedMarkets.map((market) => (
                <div
                  key={market.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 flex-1">{market.title}</p>
                    <button
                      onClick={() => removeMarket(market.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {(market.probability * 100).toFixed(0)}% probability
                    </span>
                    <button
                      onClick={() => togglePosition(market.id)}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        market.position === 'yes'
                          ? 'bg-green-100 text-green-700'
                          : market.position === 'no'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {market.position || 'Any'}
                    </button>
                  </div>
                </div>
              ))}

              {selectedMarkets.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select at least 2 markets to create a derivative</p>
                </div>
              )}
            </div>

            {/* Add Market */}
            <div className="relative">
              <button
                onClick={() => setShowMarketPicker(!showMarketPicker)}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Market
              </button>

              {showMarketPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-xl z-10 max-h-64 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search markets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-48">
                    {filteredMarkets.map((market) => (
                      <button
                        key={market.id}
                        onClick={() => addMarket(market)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{market.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(market.currentProbability * 100).toFixed(0)}% • {market.category}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Query Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Ask AI Assistant</h2>
            <div className="relative">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g., 'What's the probability both happen?' or 'Suggest a creative derivative bet...'"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <button
              onClick={analyzeWithAI}
              disabled={selectedMarkets.length < 2 || isStreaming}
              className="w-full mt-3 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - AI Response & Derivatives */}
        <div className="col-span-3 space-y-6">
          {/* AI Response */}
          {(aiResponse || isStreaming) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">AI Analysis</span>
                  {isStreaming && (
                    <span className="text-xs text-purple-600 animate-pulse">streaming...</span>
                  )}
                </div>
              </div>
              <div
                ref={responseRef}
                className="p-5 max-h-96 overflow-y-auto prose prose-sm prose-purple"
              >
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
                {isStreaming && <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />}
              </div>
            </div>
          )}

          {/* Generated Derivatives */}
          {generatedDerivatives.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Generated Derivatives</h2>
              <div className="space-y-3">
                {generatedDerivatives.map((derivative, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDerivative(derivative)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedDerivative === derivative
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-100 hover:border-purple-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            derivative.condition === 'AND'
                              ? 'bg-blue-100 text-blue-700'
                              : derivative.condition === 'OR'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {derivative.condition}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{derivative.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{derivative.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">
                          {(derivative.probability * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">probability</p>
                      </div>
                    </div>
                    {selectedDerivative === derivative && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <Check className="w-4 h-4 text-purple-600 inline mr-1" />
                        <span className="text-sm text-purple-600">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bet on Derivative */}
          {selectedDerivative && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Place Derivative Bet
              </h2>

              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 mb-1">Selected Derivative</p>
                <p className="font-medium">{selectedDerivative.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-purple-300">
                    {(selectedDerivative.probability * 100).toFixed(1)}% probability
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">{selectedDerivative.condition} condition</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Bet Amount</label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">${betAmount}</span>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="flex-1 accent-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Potential Win</p>
                    <p className="text-xl font-bold text-green-400">
                      ${(betAmount / selectedDerivative.probability).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Profit if Correct</p>
                    <p className="text-xl font-bold text-green-400">
                      ${((betAmount / selectedDerivative.probability) - betAmount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-all flex items-center justify-center gap-2">
                  Place Derivative Bet
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!aiResponse && !isStreaming && generatedDerivatives.length === 0 && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-purple-100 p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create a Derivative Market</h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Select at least 2 markets from the left panel, then click "Analyze with AI" to generate derivative market ideas combining your predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DerivativePage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <DerivativeContent />
      </Suspense>
    </AppLayout>
  );
}
