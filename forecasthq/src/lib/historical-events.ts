// Historical events and time-series metrics for backtesting
export interface HistoricalEvent {
  id: string;
  timestamp: string;
  type: 'metric' | 'news' | 'milestone' | 'alert';
  category: string;
  title: string;
  description: string;
  value?: string;
  previousValue?: string;
  change?: number;
  impact: 'positive' | 'negative' | 'neutral';
  relatedMarkets: string[];
}

export interface TimeSeriesMetric {
  id: string;
  name: string;
  unit: string;
  category: string;
  data: { timestamp: string; value: number }[];
}

// Seeded random for deterministic data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Fixed reference date to avoid hydration issues
const REFERENCE_DATE = new Date('2025-01-15T12:00:00Z');

// Generate time-series metrics synced with market history
function generateTimeSeriesMetrics(marketId: string, days: number): TimeSeriesMetric[] {
  const metrics: TimeSeriesMetric[] = [];
  const random = seededRandom(marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + 1000);

  const marketMetrics: Record<string, { id: string; name: string; unit: string; category: string; baseValue: number; volatility: number; trend: number }[]> = {
    'prod-1': [
      { id: 'dau', name: 'Daily Active Users', unit: '', category: 'Product', baseValue: 6500, volatility: 0.08, trend: 0.015 },
      { id: 'sprint-velocity', name: 'Sprint Velocity', unit: 'pts', category: 'Engineering', baseValue: 45, volatility: 0.12, trend: 0.01 },
      { id: 'bug-count', name: 'Open P1 Bugs', unit: '', category: 'Engineering', baseValue: 12, volatility: 0.3, trend: -0.02 },
      { id: 'test-coverage', name: 'Test Coverage', unit: '%', category: 'Engineering', baseValue: 78, volatility: 0.02, trend: 0.005 },
    ],
    'prod-2': [
      { id: 'dau', name: 'Daily Active Users', unit: '', category: 'Product', baseValue: 6500, volatility: 0.05, trend: 0.012 },
      { id: 'mau', name: 'Monthly Active Users', unit: '', category: 'Product', baseValue: 24000, volatility: 0.03, trend: 0.015 },
      { id: 'retention', name: 'D30 Retention', unit: '%', category: 'Product', baseValue: 42, volatility: 0.08, trend: 0.008 },
    ],
    'sales-1': [
      { id: 'deal-score', name: 'Deal Score', unit: '/10', category: 'Sales', baseValue: 7.2, volatility: 0.1, trend: 0.02 },
      { id: 'stakeholders', name: 'Stakeholders Engaged', unit: '', category: 'Sales', baseValue: 4, volatility: 0.2, trend: 0.03 },
      { id: 'competitor-mentions', name: 'Competitor Mentions', unit: '', category: 'Sales', baseValue: 2, volatility: 0.4, trend: -0.01 },
    ],
    'sales-2': [
      { id: 'mrr', name: 'Monthly Revenue', unit: 'K', category: 'Financial', baseValue: 680, volatility: 0.04, trend: 0.02 },
      { id: 'pipeline', name: 'Pipeline Value', unit: 'M', category: 'Sales', baseValue: 2.4, volatility: 0.08, trend: 0.015 },
      { id: 'win-rate', name: 'Win Rate', unit: '%', category: 'Sales', baseValue: 34, volatility: 0.1, trend: 0.005 },
    ],
    'hire-1': [
      { id: 'applications', name: 'Applications', unit: '', category: 'HR', baseValue: 45, volatility: 0.25, trend: 0.01 },
      { id: 'pipeline-candidates', name: 'Pipeline Candidates', unit: '', category: 'HR', baseValue: 8, volatility: 0.3, trend: -0.02 },
      { id: 'offer-rate', name: 'Offer Acceptance', unit: '%', category: 'HR', baseValue: 72, volatility: 0.08, trend: 0 },
    ],
    'hire-2': [
      { id: 'headcount', name: 'Engineering Headcount', unit: '', category: 'Team', baseValue: 38, volatility: 0.02, trend: 0.01 },
      { id: 'open-roles', name: 'Open Roles', unit: '', category: 'HR', baseValue: 12, volatility: 0.1, trend: -0.005 },
      { id: 'time-to-hire', name: 'Avg Time to Hire', unit: 'd', category: 'HR', baseValue: 45, volatility: 0.1, trend: -0.008 },
    ],
  };

  const selected = marketMetrics[marketId] || marketMetrics['prod-1'];

  for (const metric of selected) {
    const data: { timestamp: string; value: number }[] = [];
    let currentValue = metric.baseValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date(REFERENCE_DATE);
      date.setDate(date.getDate() - i);

      const trendEffect = metric.trend * (days - i);
      const randomVar = (random() - 0.5) * 2 * metric.volatility;
      currentValue = metric.baseValue * (1 + trendEffect + randomVar);
      currentValue = Math.max(0, currentValue);

      if (['', 'pts', 'd'].includes(metric.unit)) {
        currentValue = Math.round(currentValue);
      } else {
        currentValue = Math.round(currentValue * 10) / 10;
      }

      data.push({ timestamp: date.toISOString(), value: currentValue });
    }

    metrics.push({ id: metric.id, name: metric.name, unit: metric.unit, category: metric.category, data });
  }

  return metrics;
}

// Generate historical events for markets
function generateEventsForMarket(marketId: string, days: number): HistoricalEvent[] {
  const events: HistoricalEvent[] = [];
  const random = seededRandom(marketId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

  const templates: Record<string, Partial<HistoricalEvent>[]> = {
    'prod-1': [
      { type: 'metric', category: 'Engineering', title: 'Sprint Velocity +15%', value: '52 pts', previousValue: '45 pts', change: 15, impact: 'positive', description: 'Team exceeded sprint goals with improved CI/CD pipeline' },
      { type: 'alert', category: 'QA', title: 'Critical Bug in Payment Flow', impact: 'negative', description: 'P1 bug discovered in checkout process blocking release' },
      { type: 'milestone', category: 'Product', title: 'API v2 Feature Complete', impact: 'positive', description: 'All planned API endpoints implemented and passing tests' },
      { type: 'news', category: 'Team', title: 'Senior Engineer Joined', impact: 'positive', description: 'New hire with 10 years distributed systems experience' },
      { type: 'metric', category: 'Engineering', title: 'Test Coverage +8%', value: '86%', previousValue: '78%', change: 8, impact: 'positive', description: 'New test automation framework deployed' },
      { type: 'alert', category: 'Infra', title: 'Database Migration Delayed', impact: 'negative', description: 'Data migration taking longer than expected' },
      { type: 'milestone', category: 'Product', title: 'Beta Testing Started', impact: 'positive', description: '50 internal users now testing v2.0 features' },
      { type: 'metric', category: 'Product', title: 'DAU +12%', value: '7,280', previousValue: '6,500', change: 12, impact: 'positive', description: 'New onboarding flow driving activation' },
    ],
    'prod-2': [
      { type: 'metric', category: 'Product', title: 'DAU +6%', value: '6,890', previousValue: '6,500', change: 6, impact: 'positive', description: 'Push notifications driving re-engagement' },
      { type: 'metric', category: 'Product', title: 'Retention Drop', value: '38%', previousValue: '42%', change: -10, impact: 'negative', description: 'D30 retention declined after UI redesign' },
      { type: 'news', category: 'Marketing', title: 'Featured in App Store', impact: 'positive', description: 'Selected for "Apps We Love" collection' },
      { type: 'alert', category: 'Product', title: 'Crash Rate Spike', impact: 'negative', description: 'iOS crash rate up 3x after latest release' },
      { type: 'milestone', category: 'Product', title: 'Push Notifications Live', impact: 'positive', description: 'New engagement feature rolled out to all users' },
    ],
    'sales-1': [
      { type: 'milestone', category: 'Sales', title: 'Technical Eval Passed', impact: 'positive', description: 'Acme Corp engineering approved integration approach' },
      { type: 'news', category: 'Sales', title: 'Competitor Pitched Lower', impact: 'negative', description: 'Competitor quoted 40% below our price' },
      { type: 'metric', category: 'Sales', title: 'Deal Score Increased', value: '8.5/10', previousValue: '7.2/10', change: 18, impact: 'positive', description: 'Champion confirmed budget approval from CFO' },
      { type: 'milestone', category: 'Legal', title: 'Security Review Complete', impact: 'positive', description: 'Passed SOC2 compliance review' },
      { type: 'alert', category: 'Sales', title: 'Budget Freeze Rumor', impact: 'negative', description: 'Acme may implement Q1 spending freeze' },
      { type: 'milestone', category: 'Sales', title: 'Contract Redlined', impact: 'positive', description: 'Legal teams exchanged final contract' },
    ],
    'sales-2': [
      { type: 'metric', category: 'Financial', title: 'MRR +6%', value: '$721K', previousValue: '$680K', change: 6, impact: 'positive', description: '8 new enterprise accounts closed' },
      { type: 'metric', category: 'Sales', title: 'Win Rate Up', value: '38%', previousValue: '34%', change: 12, impact: 'positive', description: 'New sales playbook showing results' },
      { type: 'alert', category: 'Sales', title: 'Key Deal Slipped', impact: 'negative', description: 'GlobalTech $200K deal pushed to Q2' },
      { type: 'milestone', category: 'Sales', title: 'Channel Partner Signed', impact: 'positive', description: 'Reseller agreement with TechDistro' },
    ],
    'hire-1': [
      { type: 'milestone', category: 'HR', title: 'Final Round Scheduled', impact: 'positive', description: 'Top candidate agreed to exec panel interview' },
      { type: 'news', category: 'HR', title: 'Finalist Withdrew', impact: 'negative', description: 'Preferred candidate accepted competing offer' },
      { type: 'metric', category: 'HR', title: 'Applications +30%', value: '58', previousValue: '45', change: 30, impact: 'positive', description: 'LinkedIn campaign driving applicants' },
      { type: 'alert', category: 'HR', title: 'Salary Expectations Gap', impact: 'negative', description: 'Top candidate asking 30% above budget' },
      { type: 'milestone', category: 'HR', title: 'New Finalist Emerged', impact: 'positive', description: 'Strong internal referral entered pipeline' },
    ],
    'hire-2': [
      { type: 'metric', category: 'Team', title: 'Headcount +2', value: '40', previousValue: '38', change: 5, impact: 'positive', description: 'Two backend engineers started' },
      { type: 'metric', category: 'HR', title: 'Time-to-Hire Improved', value: '38d', previousValue: '45d', change: -15, impact: 'positive', description: 'Streamlined interview process' },
      { type: 'alert', category: 'Team', title: 'Senior Dev Resigned', impact: 'negative', description: 'Tech lead gave notice for startup role' },
      { type: 'milestone', category: 'HR', title: 'Career Fair Success', impact: 'positive', description: 'University event yielded 20 candidates' },
    ],
  };

  const marketTemplates = templates[marketId] || templates['prod-1'];
  const numEvents = Math.min(Math.floor(days / 3), marketTemplates.length);

  // Generate deterministic day offsets
  const dayOffsets: number[] = [];
  for (let i = 0; i < numEvents; i++) {
    dayOffsets.push(Math.floor(random() * days));
  }
  dayOffsets.sort((a, b) => b - a); // Sort descending so events are chronological

  for (let i = 0; i < numEvents; i++) {
    const daysAgo = dayOffsets[i];
    const date = new Date(REFERENCE_DATE);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(9 + Math.floor(random() * 9), Math.floor(random() * 60));

    const template = marketTemplates[i % marketTemplates.length];

    events.push({
      id: `${marketId}-event-${i}`,
      timestamp: date.toISOString(),
      type: template.type as HistoricalEvent['type'],
      category: template.category || 'General',
      title: template.title || 'Event',
      description: template.description || '',
      value: template.value,
      previousValue: template.previousValue,
      change: template.change,
      impact: template.impact as HistoricalEvent['impact'],
      relatedMarkets: [marketId],
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Cache generated data
export const HISTORICAL_EVENTS: Record<string, HistoricalEvent[]> = {
  'prod-1': generateEventsForMarket('prod-1', 30),
  'prod-2': generateEventsForMarket('prod-2', 30),
  'sales-1': generateEventsForMarket('sales-1', 21),
  'sales-2': generateEventsForMarket('sales-2', 45),
  'comp-1': generateEventsForMarket('comp-1', 14),
  'comp-2': generateEventsForMarket('comp-2', 28),
  'hire-1': generateEventsForMarket('hire-1', 60),
  'hire-2': generateEventsForMarket('hire-2', 30),
};

export const TIME_SERIES_METRICS: Record<string, TimeSeriesMetric[]> = {
  'prod-1': generateTimeSeriesMetrics('prod-1', 30),
  'prod-2': generateTimeSeriesMetrics('prod-2', 30),
  'sales-1': generateTimeSeriesMetrics('sales-1', 21),
  'sales-2': generateTimeSeriesMetrics('sales-2', 45),
  'comp-1': generateTimeSeriesMetrics('comp-1', 14),
  'comp-2': generateTimeSeriesMetrics('comp-2', 28),
  'hire-1': generateTimeSeriesMetrics('hire-1', 60),
  'hire-2': generateTimeSeriesMetrics('hire-2', 30),
};

export function getEventsForMarket(marketId: string): HistoricalEvent[] {
  return HISTORICAL_EVENTS[marketId] || [];
}

export function getMetricsForMarket(marketId: string): TimeSeriesMetric[] {
  return TIME_SERIES_METRICS[marketId] || [];
}

export function getEventsNearTimestamp(marketId: string, timestamp: Date, windowHours: number = 24): HistoricalEvent[] {
  const events = getEventsForMarket(marketId);
  const windowMs = windowHours * 60 * 60 * 1000;
  return events.filter(e => Math.abs(new Date(e.timestamp).getTime() - timestamp.getTime()) <= windowMs);
}

export function getMetricValueAtTime(metric: TimeSeriesMetric, timestamp: Date): number | null {
  for (let i = metric.data.length - 1; i >= 0; i--) {
    if (new Date(metric.data[i].timestamp) <= timestamp) {
      return metric.data[i].value;
    }
  }
  return metric.data[0]?.value ?? null;
}
