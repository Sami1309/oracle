export interface DataPoint {
  id: string;
  category: string;
  label: string;
  description: string;
  sampleValue?: string;
}

export const DATA_POINT_CATEGORIES = [
  'Performance Metrics',
  'Sales Data',
  'Product Data',
  'Team Data',
  'Market Intelligence',
  'Financial Data',
  'Custom',
] as const;

export const AVAILABLE_DATA_POINTS: DataPoint[] = [
  // Performance Metrics
  {
    id: 'sprint-velocity',
    category: 'Performance Metrics',
    label: 'Sprint Velocity',
    description: 'Average story points completed per sprint',
    sampleValue: '42 points/sprint',
  },
  {
    id: 'bug-count',
    category: 'Performance Metrics',
    label: 'Open Bug Count',
    description: 'Current number of open P1/P2 bugs',
    sampleValue: '7 bugs',
  },
  {
    id: 'test-coverage',
    category: 'Performance Metrics',
    label: 'Test Coverage',
    description: 'Code test coverage percentage',
    sampleValue: '78%',
  },
  {
    id: 'deploy-frequency',
    category: 'Performance Metrics',
    label: 'Deploy Frequency',
    description: 'Deployments per week',
    sampleValue: '4 deploys/week',
  },

  // Sales Data
  {
    id: 'pipeline-value',
    category: 'Sales Data',
    label: 'Pipeline Value',
    description: 'Total value of deals in pipeline',
    sampleValue: '$2.4M',
  },
  {
    id: 'win-rate',
    category: 'Sales Data',
    label: 'Deal Win Rate',
    description: 'Percentage of deals won vs lost',
    sampleValue: '34%',
  },
  {
    id: 'avg-deal-size',
    category: 'Sales Data',
    label: 'Average Deal Size',
    description: 'Mean value of closed deals',
    sampleValue: '$45K ARR',
  },
  {
    id: 'sales-cycle',
    category: 'Sales Data',
    label: 'Sales Cycle Length',
    description: 'Average days from lead to close',
    sampleValue: '67 days',
  },

  // Product Data
  {
    id: 'dau',
    category: 'Product Data',
    label: 'Daily Active Users',
    description: 'Users active in the last 24 hours',
    sampleValue: '6,500 users',
  },
  {
    id: 'mau',
    category: 'Product Data',
    label: 'Monthly Active Users',
    description: 'Users active in the last 30 days',
    sampleValue: '24,000 users',
  },
  {
    id: 'retention',
    category: 'Product Data',
    label: 'D30 Retention',
    description: '30-day user retention rate',
    sampleValue: '42%',
  },
  {
    id: 'nps',
    category: 'Product Data',
    label: 'NPS Score',
    description: 'Net Promoter Score',
    sampleValue: '+38',
  },
  {
    id: 'feature-adoption',
    category: 'Product Data',
    label: 'Feature Adoption',
    description: 'Percentage using key feature',
    sampleValue: '28%',
  },

  // Team Data
  {
    id: 'headcount',
    category: 'Team Data',
    label: 'Current Headcount',
    description: 'Total team size',
    sampleValue: '38 people',
  },
  {
    id: 'open-roles',
    category: 'Team Data',
    label: 'Open Roles',
    description: 'Number of open positions',
    sampleValue: '12 roles',
  },
  {
    id: 'attrition',
    category: 'Team Data',
    label: 'Attrition Rate',
    description: 'Annual employee turnover',
    sampleValue: '15%',
  },
  {
    id: 'time-to-hire',
    category: 'Team Data',
    label: 'Time to Hire',
    description: 'Average days to fill a role',
    sampleValue: '45 days',
  },

  // Market Intelligence
  {
    id: 'competitor-funding',
    category: 'Market Intelligence',
    label: 'Competitor Funding',
    description: 'Recent competitor funding news',
    sampleValue: 'Series B $30M',
  },
  {
    id: 'market-size',
    category: 'Market Intelligence',
    label: 'TAM/SAM',
    description: 'Total addressable market size',
    sampleValue: '$4.2B TAM',
  },
  {
    id: 'market-growth',
    category: 'Market Intelligence',
    label: 'Market Growth Rate',
    description: 'YoY market growth',
    sampleValue: '23% YoY',
  },

  // Financial Data
  {
    id: 'arr',
    category: 'Financial Data',
    label: 'Current ARR',
    description: 'Annual recurring revenue',
    sampleValue: '$8.2M',
  },
  {
    id: 'mrr-growth',
    category: 'Financial Data',
    label: 'MRR Growth',
    description: 'Month-over-month MRR growth',
    sampleValue: '+8%',
  },
  {
    id: 'runway',
    category: 'Financial Data',
    label: 'Runway',
    description: 'Months of runway remaining',
    sampleValue: '18 months',
  },
  {
    id: 'burn-rate',
    category: 'Financial Data',
    label: 'Burn Rate',
    description: 'Monthly cash burn',
    sampleValue: '$420K/mo',
  },
];

export function searchDataPoints(query: string): DataPoint[] {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_DATA_POINTS.filter(
    (dp) =>
      dp.label.toLowerCase().includes(lowerQuery) ||
      dp.description.toLowerCase().includes(lowerQuery) ||
      dp.category.toLowerCase().includes(lowerQuery)
  );
}

export function getDataPointsByCategory(category: string): DataPoint[] {
  return AVAILABLE_DATA_POINTS.filter((dp) => dp.category === category);
}
