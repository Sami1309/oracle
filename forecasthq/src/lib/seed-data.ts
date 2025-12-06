export interface Market {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'sales' | 'competitor' | 'hiring' | 'fun';
  resolutionCriteria: string;
  currentProbability: number;
  yesShares: number;
  noShares: number;
  volume: number;
  traders: number;
  history: { timestamp: string; probability: number }[];
  closesAt: string;
  createdBy: string;
  department: string;
}

function generateProbabilityHistory(start: number, end: number, days: number) {
  const history = [];
  const now = new Date();

  // Generate more data points (multiple per day for granularity)
  const pointsPerDay = 4;
  const totalPoints = days * pointsPerDay;

  let currentProb = start;

  for (let i = totalPoints; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - (i * (24 / pointsPerDay)));

    // Step changes - only update probability occasionally (simulating trades)
    if (Math.random() > 0.6) {
      const drift = (end - currentProb) * 0.05; // Drift toward target
      const jump = (Math.random() - 0.5) * 0.08; // Random jump
      currentProb = Math.max(0.05, Math.min(0.95, currentProb + drift + jump));
    }

    history.push({
      timestamp: date.toISOString(),
      probability: currentProb * 100,
    });
  }

  // Ensure last point is close to end value
  if (history.length > 0) {
    history[history.length - 1].probability = end * 100;
  }

  return history;
}

export const DEMO_MARKETS: Market[] = [
  // Product Markets
  {
    id: 'prod-1',
    title: 'Will the v2.0 release ship before March 15?',
    description: 'Major platform update including new dashboard and API improvements.',
    category: 'product',
    resolutionCriteria: 'v2.0 is deployed to production and announced in #releases channel',
    currentProbability: 0.58,
    yesShares: 5800,
    noShares: 4200,
    volume: 32400,
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
    yesShares: 4200,
    noShares: 5800,
    volume: 28900,
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
    yesShares: 7100,
    noShares: 2900,
    volume: 45200,
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
    yesShares: 6400,
    noShares: 3600,
    volume: 56700,
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
    yesShares: 3800,
    noShares: 6200,
    volume: 18900,
    traders: 28,
    history: generateProbabilityHistory(0.25, 0.38, 14),
    closesAt: '2025-04-01',
    createdBy: 'Alex Thompson',
    department: 'Strategy',
  },
  {
    id: 'comp-2',
    title: 'Will Competitor Y raise a Series C by end of Q1?',
    description: "Market intel suggests they're in active fundraising.",
    category: 'competitor',
    resolutionCriteria: 'Funding announcement on Crunchbase or official press',
    currentProbability: 0.55,
    yesShares: 5500,
    noShares: 4500,
    volume: 23400,
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
    yesShares: 2800,
    noShares: 7200,
    volume: 8900,
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
    yesShares: 5200,
    noShares: 4800,
    volume: 15600,
    traders: 45,
    history: generateProbabilityHistory(0.60, 0.52, 30),
    closesAt: '2025-06-30',
    createdBy: 'HR Team',
    department: 'HR',
  },
];

export function getMarketById(id: string): Market | undefined {
  return DEMO_MARKETS.find((m) => m.id === id);
}

export function getMarketsByCategory(category: string): Market[] {
  if (category === 'all') return DEMO_MARKETS;
  return DEMO_MARKETS.filter((m) => m.category === category);
}
