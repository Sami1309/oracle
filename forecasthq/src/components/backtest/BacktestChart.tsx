'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { HistoricalEvent, TimeSeriesMetric, getMetricValueAtTime } from '@/lib/historical-events';
import { TrendingUp, TrendingDown, AlertCircle, Flag, Newspaper, Activity } from 'lucide-react';

interface BacktestChartProps {
  history: { timestamp: string; probability: number }[];
  events: HistoricalEvent[];
  metrics: TimeSeriesMetric[];
  onTimeSelect: (timestamp: Date, probability: number) => void;
  selectedTimestamp: Date | null;
}

const eventIcons: Record<string, React.ReactNode> = {
  metric: <Activity className="w-3 h-3" />,
  milestone: <Flag className="w-3 h-3" />,
  news: <Newspaper className="w-3 h-3" />,
  alert: <AlertCircle className="w-3 h-3" />,
};

const impactColors = {
  positive: 'bg-emerald-500',
  negative: 'bg-rose-500',
  neutral: 'bg-slate-400',
};

export function BacktestChart({ history, events, metrics, onTimeSelect, selectedTimestamp }: BacktestChartProps) {
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null);

  // Map events to chart positions
  const eventPositions = useMemo(() => {
    return events.map(event => {
      const eventTime = new Date(event.timestamp).getTime();
      let closest = history[0];
      let closestDiff = Infinity;

      for (const h of history) {
        const diff = Math.abs(new Date(h.timestamp).getTime() - eventTime);
        if (diff < closestDiff) {
          closestDiff = diff;
          closest = h;
        }
      }

      return { event, probability: closest?.probability || 50 };
    });
  }, [events, history]);

  const handleMouseMove = useCallback((e: any) => {
    if (e?.activePayload?.[0]) {
      const { timestamp, probability } = e.activePayload[0].payload;
      onTimeSelect(new Date(timestamp), probability);
    }
  }, [onTimeSelect]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    const { timestamp, probability } = payload[0].payload;
    const time = new Date(timestamp);

    // Get nearby events
    const nearbyEvents = events.filter(e => {
      const diff = Math.abs(new Date(e.timestamp).getTime() - time.getTime());
      return diff < 1000 * 60 * 60 * 12;
    });

    // Get metric values at this time
    const metricValues = metrics.map(m => ({
      name: m.name,
      unit: m.unit,
      value: getMetricValueAtTime(m, time),
    })).filter(m => m.value !== null);

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-4 max-w-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-lg font-bold text-slate-900">{probability.toFixed(1)}%</span>
        </div>

        {metricValues.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metrics</span>
            <div className="mt-1.5 space-y-1">
              {metricValues.slice(0, 4).map((m, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{m.name}</span>
                  <span className="font-medium text-slate-800">
                    {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                    {m.unit && <span className="text-slate-400 ml-0.5">{m.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {nearbyEvents.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Events</span>
            <div className="mt-1.5 space-y-1.5">
              {nearbyEvents.slice(0, 2).map((e, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`mt-0.5 p-1 rounded ${impactColors[e.impact]}`}>
                    <span className="text-white">{eventIcons[e.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{e.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Forecast History</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Positive Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-500">Negative Event</span>
          </div>
        </div>
      </div>

      <div className="h-72 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} onMouseMove={handleMouseMove}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#e2e8f0"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v}%`}
              stroke="#e2e8f0"
              tickLine={false}
              axisLine={false}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />

            {/* Event markers */}
            {eventPositions.map(({ event, probability }) => (
              <ReferenceDot
                key={event.id}
                x={event.timestamp}
                y={probability}
                r={6}
                fill={event.impact === 'positive' ? '#10b981' : event.impact === 'negative' ? '#f43f5e' : '#94a3b8'}
                stroke="white"
                strokeWidth={2}
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{ cursor: 'pointer' }}
              />
            ))}

            {/* Selected time indicator */}
            {selectedTimestamp && (
              <ReferenceLine
                x={selectedTimestamp.toISOString()}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}

            <Line
              type="stepAfter"
              dataKey="probability"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hovered event details */}
      {hoveredEvent && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${impactColors[hoveredEvent.impact]}`}>
              <span className="text-white">{eventIcons[hoveredEvent.type]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-slate-900">{hoveredEvent.title}</h4>
                {hoveredEvent.change !== undefined && (
                  <span className={`flex items-center gap-0.5 text-sm font-medium ${hoveredEvent.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {hoveredEvent.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {hoveredEvent.change > 0 ? '+' : ''}{hoveredEvent.change}%
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">{hoveredEvent.description}</p>
              {hoveredEvent.value && (
                <div className="mt-2 flex items-center gap-3 text-sm">
                  {hoveredEvent.previousValue && <span className="text-slate-400">{hoveredEvent.previousValue}</span>}
                  {hoveredEvent.previousValue && <span className="text-slate-300">→</span>}
                  <span className="font-medium text-slate-700">{hoveredEvent.value}</span>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-400">
                {hoveredEvent.category} • {new Date(hoveredEvent.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
