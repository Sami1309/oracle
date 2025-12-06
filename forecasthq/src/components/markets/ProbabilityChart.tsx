'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ProbabilityChartProps {
  history: { timestamp: string; probability: number }[];
}

export function ProbabilityChart({ history }: ProbabilityChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4 text-sm">Probability Over Time</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#94a3b8"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
              stroke="#94a3b8"
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Line
              type="stepAfter"
              dataKey="probability"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
