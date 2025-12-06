# B2B Prediction Market Demo: Implementation Plan

## Executive Summary

**Goal**: Build a shareable, interactive demo that showcases a modern AI-powered corporate prediction market in 5-6 days.

**Demo URL Strategy**: Deploy to Vercel (free tier) at something like `https://forecasthq.vercel.app` or similar branded domain.

**Key Differentiators to Showcase**:
1. AI-powered question generation
2. LLM forecasting assistant
3. Executive insight summaries
4. Modern, clean enterprise UX
5. Slack-like real-time feel

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   Next.js 14 + Tailwind                      │
│                   Deployed on Vercel                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │   Markets   │  │   AI Assistant      │  │
│  │  Overview   │  │   Trading   │  │   (Claude API)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│              Next.js API Routes + Prisma                     │
│              (or Supabase for faster setup)                  │
├─────────────────────────────────────────────────────────────┤
│                       DATABASE                               │
│                  Supabase (PostgreSQL)                       │
│                  Free tier sufficient                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Day-by-Day Implementation Plan

### Day 1: Foundation & Core UI (8-10 hours)

**Morning: Project Setup**
```bash
npx create-next-app@latest forecasthq --typescript --tailwind --app
cd forecasthq
npm install @supabase/supabase-js @anthropic-ai/sdk recharts lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-popover
```

**Afternoon: Core Pages & Layout**

Build these pages:
1. `/` - Landing/Login page
2. `/dashboard` - Main dashboard with market overview
3. `/markets` - List of all markets
4. `/markets/[id]` - Individual market detail + trading
5. `/ai-assistant` - AI forecasting chat
6. `/admin` - Market creation & resolution

**Component Structure**:
```
/components
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
    Badge.tsx
  /markets
    MarketCard.tsx
    MarketList.tsx
    TradingPanel.tsx
    ProbabilityChart.tsx
  /ai
    ChatInterface.tsx
    QuestionGenerator.tsx
    InsightPanel.tsx
  /layout
    Sidebar.tsx
    Header.tsx
    DemoNotice.tsx
```

**Evening: Database Schema (Supabase)**

```sql
-- Users (simplified for demo)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  balance DECIMAL DEFAULT 1000,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Markets
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'product', 'sales', 'hiring', 'competitor', 'fun'
  resolution_criteria TEXT,
  closes_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  resolved_value BOOLEAN,
  current_probability DECIMAL DEFAULT 0.5,
  total_volume DECIMAL DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id),
  user_id UUID REFERENCES users(id),
  position BOOLEAN, -- true = YES, false = NO
  shares DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Interactions (for demo analytics)
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  interaction_type TEXT, -- 'question_gen', 'forecast_assist', 'insight'
  input_text TEXT,
  output_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Day 2: Market Mechanics & Trading UI (8-10 hours)

**LMSR Market Maker Implementation**

```typescript
// lib/lmsr.ts
// Logarithmic Market Scoring Rule - industry standard for prediction markets

export class LMSR {
  private b: number; // liquidity parameter
  
  constructor(liquidity: number = 100) {
    this.b = liquidity;
  }
  
  // Calculate cost to buy shares
  cost(currentYes: number, currentNo: number, buyYes: number, buyNo: number): number {
    const before = this.b * Math.log(
      Math.exp(currentYes / this.b) + Math.exp(currentNo / this.b)
    );
    const after = this.b * Math.log(
      Math.exp((currentYes + buyYes) / this.b) + 
      Math.exp((currentNo + buyNo) / this.b)
    );
    return after - before;
  }
  
  // Get current probability
  probability(currentYes: number, currentNo: number): number {
    const expYes = Math.exp(currentYes / this.b);
    const expNo = Math.exp(currentNo / this.b);
    return expYes / (expYes + expNo);
  }
  
  // Calculate shares received for a given cost
  sharesToBuy(
    currentYes: number, 
    currentNo: number, 
    amount: number, 
    buyingYes: boolean
  ): number {
    // Binary search for shares
    let low = 0;
    let high = amount * 10;
    
    while (high - low > 0.001) {
      const mid = (low + high) / 2;
      const cost = buyingYes 
        ? this.cost(currentYes, currentNo, mid, 0)
        : this.cost(currentYes, currentNo, 0, mid);
      
      if (cost < amount) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return low;
  }
}
```

**Trading Panel Component**

```tsx
// components/markets/TradingPanel.tsx
'use client';

import { useState } from 'react';
import { LMSR } from '@/lib/lmsr';

interface TradingPanelProps {
  market: {
    id: string;
    title: string;
    currentProbability: number;
    yesShares: number;
    noShares: number;
  };
  userBalance: number;
  onTrade: (position: boolean, amount: number) => void;
}

export function TradingPanel({ market, userBalance, onTrade }: TradingPanelProps) {
  const [amount, setAmount] = useState(10);
  const [position, setPosition] = useState<'yes' | 'no'>('yes');
  
  const lmsr = new LMSR(100);
  
  const shares = lmsr.sharesToBuy(
    market.yesShares,
    market.noShares,
    amount,
    position === 'yes'
  );
  
  const newProb = position === 'yes'
    ? lmsr.probability(market.yesShares + shares, market.noShares)
    : lmsr.probability(market.yesShares, market.noShares + shares);
  
  const potentialPayout = shares; // If correct, you get 1 per share
  const impliedOdds = position === 'yes' ? market.currentProbability : 1 - market.currentProbability;
  
  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      <h3 className="font-semibold text-lg">Place Prediction</h3>
      
      {/* Position Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPosition('yes')}
          className={`py-3 rounded-lg font-medium transition-all ${
            position === 'yes'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Yes ({(market.currentProbability * 100).toFixed(0)}%)
        </button>
        <button
          onClick={() => setPosition('no')}
          className={`py-3 rounded-lg font-medium transition-all ${
            position === 'no'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          No ({((1 - market.currentProbability) * 100).toFixed(0)}%)
        </button>
      </div>
      
      {/* Amount Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount</span>
          <span className="font-medium">${amount}</span>
        </div>
        <input
          type="range"
          min={1}
          max={Math.min(100, userBalance)}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>$1</span>
          <span>Balance: ${userBalance.toFixed(0)}</span>
        </div>
      </div>
      
      {/* Trade Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Shares received</span>
          <span className="font-medium">{shares.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Avg price per share</span>
          <span className="font-medium">${(amount / shares).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Potential payout</span>
          <span className="font-medium text-green-600">${potentialPayout.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">New market probability</span>
          <span className="font-medium">{(newProb * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        onClick={() => onTrade(position === 'yes', amount)}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Predict {position.toUpperCase()} for ${amount}
      </button>
    </div>
  );
}
```

**Probability History Chart**

```tsx
// components/markets/ProbabilityChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProbabilityChartProps {
  history: { timestamp: string; probability: number }[];
}

export function ProbabilityChart({ history }: ProbabilityChartProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">Probability Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString()}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="probability" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

### Day 3: AI Features - The Key Differentiator (8-10 hours)

This is what sets your demo apart. Implement three core AI features:

**Feature 1: AI Question Generator**

```typescript
// app/api/ai/generate-question/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { topic, context, department } = await req.json();
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are an expert at creating prediction market questions for corporate decision-making. 
    
Good prediction market questions are:
1. Binary (yes/no resolvable)
2. Specific with clear resolution criteria
3. Time-bound with explicit deadlines
4. Decision-relevant (the answer matters for business decisions)
5. Verifiable from objective sources

Bad questions: vague, subjective, impossible to verify, or irrelevant to decisions.`,
    messages: [
      {
        role: 'user',
        content: `Create 3 prediction market questions about: "${topic}"

Context: ${context || 'General corporate setting'}
Department: ${department || 'Strategy'}

For each question, provide:
1. The question itself
2. Resolution criteria (how we'll determine yes/no)
3. Suggested closing date
4. Why this question is decision-relevant

Format as JSON array.`
      }
    ]
  });
  
  // Parse response
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  
  return NextResponse.json({ questions });
}
```

```tsx
// components/ai/QuestionGenerator.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';

export function QuestionGenerator({ onSelectQuestion }: { onSelectQuestion: (q: any) => void }) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });
      const data = await res.json();
      setSuggestions(data.questions);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold">AI Question Generator</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Describe what you want to predict and let AI craft well-structured market questions.
      </p>
      
      <div className="space-y-3">
        <input
          type="text"
          placeholder="What do you want to predict? (e.g., 'Q1 product launch', 'competitor pricing')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <textarea
          placeholder="Additional context (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={generate}
          disabled={!topic || loading}
          className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate Questions
        </button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700">Suggested Questions:</p>
          {suggestions.map((q, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-2 border">
              <p className="font-medium">{q.question}</p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Resolution:</span> {q.resolution_criteria}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Closes:</span> {q.closing_date}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Why it matters:</span> {q.decision_relevance}
              </p>
              <button
                onClick={() => onSelectQuestion(q)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Use this question
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Feature 2: AI Forecasting Assistant**

```typescript
// app/api/ai/forecast-assist/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { question, currentProbability, userMessage, conversationHistory } = await req.json();
  
  const systemPrompt = `You are a forecasting assistant helping employees make better predictions. You're helping analyze this prediction market question:

"${question}"

Current market probability: ${(currentProbability * 100).toFixed(1)}%

Your role:
1. Help users think through base rates and reference classes
2. Identify key factors that would move the probability up or down
3. Point out potential biases (anchoring, optimism bias, availability bias)
4. Suggest information sources to consult
5. Ask probing questions to refine their thinking

Be concise but insightful. Don't tell them what to predict—help them think better.`;

  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  return NextResponse.json({ response: text });
}
```

```tsx
// components/ai/ForecastingAssistant.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ForecastingAssistantProps {
  question: string;
  currentProbability: number;
}

export function ForecastingAssistant({ question, currentProbability }: ForecastingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I'm here to help you think through your prediction on "${question}". The market currently estimates ${(currentProbability * 100).toFixed(0)}% probability of YES.

What's your initial intuition, and what's driving it?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai/forecast-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          currentProbability,
          userMessage,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  
  return (
    <div className="bg-white rounded-xl border flex flex-col h-[500px]">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">Forecasting Assistant</h3>
            <p className="text-xs text-gray-500">AI-powered analysis to improve your predictions</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center ${
              m.role === 'assistant' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              {m.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-purple-600" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              m.role === 'assistant' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-blue-600 text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-purple-100">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for help analyzing this prediction..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Feature 3: Executive Insight Generator**

```typescript
// app/api/ai/executive-summary/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { markets } = await req.json();
  
  const marketsContext = markets.map((m: any) => 
    `- "${m.title}": ${(m.currentProbability * 100).toFixed(0)}% YES (${m.trades} trades, closes ${m.closesAt})`
  ).join('\n');
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are an executive briefing assistant summarizing prediction market insights for senior leadership. Be concise, actionable, and highlight what matters most.`,
    messages: [
      {
        role: 'user',
        content: `Generate an executive summary of these active prediction markets:

${marketsContext}

Include:
1. Key takeaways (2-3 bullets)
2. Markets requiring attention (low confidence or surprising)
3. Recommended actions
4. Risks to monitor

Keep it under 200 words. Write for a busy executive.`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  
  return NextResponse.json({ summary: text });
}
```

---

### Day 4: Dashboard & Polish (8-10 hours)

**Main Dashboard**

```tsx
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Sparkles, RefreshCw } from 'lucide-react';
import { MarketCard } from '@/components/markets/MarketCard';

// Demo data
const DEMO_MARKETS = [
  {
    id: '1',
    title: 'Will we ship the mobile app by March 31?',
    category: 'product',
    currentProbability: 0.62,
    volume: 2340,
    traders: 47,
    trend: 0.08,
    closesAt: '2025-03-31',
  },
  {
    id: '2', 
    title: 'Will competitor X announce a price cut in Q1?',
    category: 'competitor',
    currentProbability: 0.34,
    volume: 1890,
    traders: 38,
    trend: -0.12,
    closesAt: '2025-03-31',
  },
  {
    id: '3',
    title: 'Will we exceed $10M ARR by end of Q2?',
    category: 'sales',
    currentProbability: 0.71,
    volume: 4520,
    traders: 89,
    trend: 0.05,
    closesAt: '2025-06-30',
  },
  {
    id: '4',
    title: 'Will the VP of Engineering role be filled by Feb 28?',
    category: 'hiring',
    currentProbability: 0.28,
    volume: 890,
    traders: 23,
    trend: -0.15,
    closesAt: '2025-02-28',
  },
];

export default function Dashboard() {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markets: DEMO_MARKETS }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
    }
    setLoadingSummary(false);
  };
  
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Prediction Dashboard</h1>
        <p className="text-gray-500">Collective intelligence for better decisions</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />}
          label="Active Markets"
          value="24"
          change="+3 this week"
        />
        <StatCard 
          icon={<Users className="w-5 h-5" />}
          label="Active Traders"
          value="156"
          change="78% participation"
        />
        <StatCard 
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Volume"
          value="$47.2K"
          change="+12% vs last month"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />}
          label="Forecast Accuracy"
          value="73%"
          change="Brier: 0.18"
        />
      </div>
      
      {/* AI Executive Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold">AI Executive Summary</h2>
          </div>
          <button
            onClick={generateSummary}
            disabled={loadingSummary}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
            Generate
          </button>
        </div>
        {summary ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Click "Generate" to get an AI-powered executive briefing on current market insights.
          </p>
        )}
      </div>
      
      {/* Markets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Active Markets</h2>
          <div className="flex gap-2">
            {['all', 'product', 'sales', 'competitor', 'hiring'].map(cat => (
              <button
                key={cat}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 capitalize"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {DEMO_MARKETS.map(market => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-400">{change}</div>
    </div>
  );
}
```

**Market Card Component**

```tsx
// components/markets/MarketCard.tsx
import Link from 'next/link';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';

interface MarketCardProps {
  market: {
    id: string;
    title: string;
    category: string;
    currentProbability: number;
    volume: number;
    traders: number;
    trend: number;
    closesAt: string;
  };
}

const categoryColors: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700',
  sales: 'bg-green-100 text-green-700',
  competitor: 'bg-orange-100 text-orange-700',
  hiring: 'bg-purple-100 text-purple-700',
  fun: 'bg-pink-100 text-pink-700',
};

export function MarketCard({ market }: MarketCardProps) {
  const daysLeft = Math.ceil(
    (new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <Link href={`/markets/${market.id}`}>
      <div className="bg-white rounded-xl border p-5 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[market.category]}`}>
            {market.category}
          </span>
          <div className="flex items-center gap-1 text-sm">
            {market.trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={market.trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {market.trend > 0 ? '+' : ''}{(market.trend * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-4 line-clamp-2">
          {market.title}
        </h3>
        
        {/* Probability Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-600 font-medium">
              YES {(market.currentProbability * 100).toFixed(0)}%
            </span>
            <span className="text-red-600 font-medium">
              NO {((1 - market.currentProbability) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-red-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${market.currentProbability * 100}%` }}
            />
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{market.traders} traders</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{daysLeft}d left</span>
          </div>
          <span>${market.volume.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
```

---

### Day 5: Realistic Data & Edge Cases (6-8 hours)

**Seed Realistic Demo Data**

```typescript
// lib/seed-data.ts
export const DEMO_MARKETS = [
  // Product Markets
  {
    id: 'prod-1',
    title: 'Will the v2.0 release ship before March 15?',
    description: 'Major platform update including new dashboard and API improvements.',
    category: 'product',
    resolutionCriteria: 'v2.0 is deployed to production and announced in #releases channel',
    currentProbability: 0.58,
    yesShares: 580,
    noShares: 420,
    volume: 3240,
    traders: 67,
    history: generateProbabilityHistory(0.45, 0.58, 30),
    closesAt: '2025-03-15',
    createdBy: 'Sarah Chen',
    department: 'Engineering',
  },
  {
    id: 'prod-2',
    title: 'Will mobile app daily active users exceed 10,000 by end of Q1?',
    description: 'Current DAU is ~6,500. Target requires 54% growth.',
    category: 'product',
    resolutionCriteria: 'Analytics dashboard shows 10,000+ DAU for 7 consecutive days',
    currentProbability: 0.42,
    yesShares: 420,
    noShares: 580,
    volume: 2890,
    traders: 52,
    history: generateProbabilityHistory(0.55, 0.42, 30),
    closesAt: '2025-03-31',
    createdBy: 'Mike Johnson',
    department: 'Product',
  },
  
  // Sales Markets
  {
    id: 'sales-1',
    title: 'Will we close the Acme Corp enterprise deal in February?',
    description: '$500K ARR deal. Currently in procurement review.',
    category: 'sales',
    resolutionCriteria: 'Signed contract received by Feb 28, 2025',
    currentProbability: 0.71,
    yesShares: 710,
    noShares: 290,
    volume: 4520,
    traders: 34,
    history: generateProbabilityHistory(0.50, 0.71, 21),
    closesAt: '2025-02-28',
    createdBy: 'David Park',
    department: 'Sales',
  },
  {
    id: 'sales-2',
    title: 'Will Q1 revenue exceed $2.5M?',
    description: 'Q4 was $2.1M. Pipeline suggests strong Q1.',
    category: 'sales',
    resolutionCriteria: 'Finance confirms Q1 recognized revenue >= $2.5M',
    currentProbability: 0.64,
    yesShares: 640,
    noShares: 360,
    volume: 5670,
    traders: 89,
    history: generateProbabilityHistory(0.60, 0.64, 45),
    closesAt: '2025-04-15',
    createdBy: 'Lisa Wang',
    department: 'Finance',
  },
  
  // Competitor Markets
  {
    id: 'comp-1',
    title: 'Will Competitor X announce a major product pivot before April?',
    description: 'Rumors of strategic shift after leadership change.',
    category: 'competitor',
    resolutionCriteria: 'Official press release or earnings call announcement',
    currentProbability: 0.38,
    yesShares: 380,
    noShares: 620,
    volume: 1890,
    traders: 28,
    history: generateProbabilityHistory(0.25, 0.38, 14),
    closesAt: '2025-04-01',
    createdBy: 'Alex Thompson',
    department: 'Strategy',
  },
  {
    id: 'comp-2',
    title: 'Will Competitor Y raise a Series C by end of Q1?',
    description: 'Market intel suggests they\'re in active fundraising.',
    category: 'competitor',
    resolutionCriteria: 'Funding announcement on Crunchbase or official press',
    currentProbability: 0.55,
    yesShares: 550,
    noShares: 450,
    volume: 2340,
    traders: 41,
    history: generateProbabilityHistory(0.45, 0.55, 28),
    closesAt: '2025-03-31',
    createdBy: 'Rachel Green',
    department: 'Strategy',
  },
  
  // Hiring Markets
  {
    id: 'hire-1',
    title: 'Will the VP of Engineering role be filled by March 1?',
    description: 'Active search for 3 months. 2 finalists remaining.',
    category: 'hiring',
    resolutionCriteria: 'Signed offer accepted and announced in #general',
    currentProbability: 0.28,
    yesShares: 280,
    noShares: 720,
    volume: 890,
    traders: 23,
    history: generateProbabilityHistory(0.45, 0.28, 60),
    closesAt: '2025-03-01',
    createdBy: 'HR Team',
    department: 'HR',
  },
  {
    id: 'hire-2',
    title: 'Will engineering headcount reach 50 by end of Q2?',
    description: 'Currently at 38. 12 hires needed in 6 months.',
    category: 'hiring',
    resolutionCriteria: 'HR confirms 50+ engineers on payroll as of June 30',
    currentProbability: 0.52,
    yesShares: 520,
    noShares: 480,
    volume: 1560,
    traders: 45,
    history: generateProbabilityHistory(0.60, 0.52, 30),
    closesAt: '2025-06-30',
    createdBy: 'HR Team',
    department: 'HR',
  },
];

function generateProbabilityHistory(start: number, end: number, days: number) {
  const history = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random walk with drift toward end value
    const progress = (days - i) / days;
    const targetProb = start + (end - start) * progress;
    const noise = (Math.random() - 0.5) * 0.1;
    const prob = Math.max(0.05, Math.min(0.95, targetProb + noise));
    
    history.push({
      timestamp: date.toISOString(),
      probability: prob * 100,
    });
  }
  
  return history;
}
```

---

### Day 6: Deploy & Document (4-6 hours)

**Deployment Checklist**

```bash
# 1. Environment Variables (Vercel)
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 2. Deploy to Vercel
vercel --prod

# 3. Custom domain (optional but recommended)
# forecasthq.com or similar
```

**Add Demo Notice Banner**

```tsx
// components/layout/DemoNotice.tsx
export function DemoNotice() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm">
      🚀 <strong>ForecastHQ Demo</strong> — AI-powered prediction markets for enterprise decision-making. 
      <a href="mailto:you@email.com" className="underline ml-2">Get early access →</a>
    </div>
  );
}
```

**Landing Page for Non-Logged-In Users**

```tsx
// app/page.tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-white">
            Prediction Markets for<br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Enterprise Decision-Making
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Harness collective intelligence. Let your team bet on outcomes 
            to surface accurate forecasts and align on priorities.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/dashboard"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
            >
              Try Demo
            </a>
            <a 
              href="#features"
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20"
            >
              Learn More
            </a>
          </div>
        </div>
        
        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon="🎯"
            title="Better Forecasts"
            description="Market prices aggregate dispersed information into accurate predictions, outperforming top-down estimates."
          />
          <FeatureCard
            icon="🤖"
            title="AI-Augmented"
            description="LLM assistants help frame questions, identify biases, and generate executive summaries."
          />
          <FeatureCard
            icon="⚡"
            title="Real-Time Signals"
            description="See probability shifts as they happen. Get early warning when projects are off-track."
          />
        </div>
        
        {/* Social Proof */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-4">Built on proven research</p>
          <div className="flex justify-center gap-8 text-gray-500">
            <span>Google ran internal markets for 15+ years</span>
            <span>•</span>
            <span>HP markets beat official forecasts by 25%</span>
            <span>•</span>
            <span>Anthropic launched internal markets in 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Key Files Checklist

```
/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── markets/
│   │   ├── page.tsx               # Market list
│   │   └── [id]/page.tsx          # Individual market
│   ├── admin/
│   │   └── page.tsx               # Create/resolve markets
│   └── api/
│       └── ai/
│           ├── generate-question/route.ts
│           ├── forecast-assist/route.ts
│           └── executive-summary/route.ts
├── components/
│   ├── ui/                        # Reusable UI components
│   ├── markets/
│   │   ├── MarketCard.tsx
│   │   ├── MarketList.tsx
│   │   ├── TradingPanel.tsx
│   │   └── ProbabilityChart.tsx
│   ├── ai/
│   │   ├── QuestionGenerator.tsx
│   │   ├── ForecastingAssistant.tsx
│   │   └── InsightPanel.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── DemoNotice.tsx
├── lib/
│   ├── lmsr.ts                    # Market maker logic
│   ├── supabase.ts                # Database client
│   └── seed-data.ts               # Demo data
└── public/
    └── og-image.png               # Social share image
```

---

## What to Show YC Partners

1. **Live Demo Link** — Let them click around and trade
2. **AI Features** — Generate a question, chat with assistant, get executive summary
3. **Market Mechanics** — Show how trading moves probabilities
4. **Design Quality** — Modern, clean, enterprise-ready
5. **Speed** — "Built in X days" shows execution capability

---

## Total Time Estimate

| Day | Focus | Hours |
|-----|-------|-------|
| 1 | Foundation & Core UI | 8-10 |
| 2 | Market Mechanics & Trading | 8-10 |
| 3 | AI Features (key differentiator) | 8-10 |
| 4 | Dashboard & Polish | 8-10 |
| 5 | Data & Edge Cases | 6-8 |
| 6 | Deploy & Document | 4-6 |
| **Total** | | **42-54 hours** |

This is aggressive but achievable with focused effort and AI assistance for boilerplate code.