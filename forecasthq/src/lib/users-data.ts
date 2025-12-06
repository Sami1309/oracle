export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: string;
  balance: number;
  joinedAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  position: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentValue: number;
  profit: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  marketId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userDepartment: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export const DEMO_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@forecasthq.com',
    avatar: 'DU',
    department: 'Engineering',
    role: 'Senior Engineer',
    balance: 1000,
    joinedAt: '2024-09-15',
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah@forecasthq.com',
    avatar: 'SC',
    department: 'Engineering',
    role: 'Engineering Manager',
    balance: 1250,
    joinedAt: '2024-06-01',
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@forecasthq.com',
    avatar: 'MJ',
    department: 'Product',
    role: 'Product Manager',
    balance: 890,
    joinedAt: '2024-07-20',
  },
  {
    id: 'user-4',
    name: 'David Park',
    email: 'david@forecasthq.com',
    avatar: 'DP',
    department: 'Sales',
    role: 'Account Executive',
    balance: 1450,
    joinedAt: '2024-08-10',
  },
];

export const DEMO_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    marketId: 'prod-1',
    marketTitle: 'Will the v2.0 release ship before March 15?',
    position: 'yes',
    shares: 25,
    avgPrice: 0.52,
    currentValue: 14.5,
    profit: 1.5,
    createdAt: '2025-01-15',
  },
  {
    id: 'pos-2',
    marketId: 'sales-1',
    marketTitle: 'Will we close the Acme Corp enterprise deal in February?',
    position: 'yes',
    shares: 40,
    avgPrice: 0.65,
    currentValue: 28.4,
    profit: 2.4,
    createdAt: '2025-01-20',
  },
  {
    id: 'pos-3',
    marketId: 'hire-1',
    marketTitle: 'Will the VP of Engineering role be filled by March 1?',
    position: 'no',
    shares: 30,
    avgPrice: 0.68,
    currentValue: 21.6,
    profit: 1.2,
    createdAt: '2025-01-22',
  },
  {
    id: 'pos-4',
    marketId: 'comp-1',
    marketTitle: 'Will Competitor X announce a major product pivot before April?',
    position: 'yes',
    shares: 15,
    avgPrice: 0.32,
    currentValue: 5.7,
    profit: 0.9,
    createdAt: '2025-01-25',
  },
];

export const DEMO_COMMENTS: Comment[] = [
  // Comments for prod-1
  {
    id: 'comment-1',
    marketId: 'prod-1',
    userId: 'user-2',
    userName: 'Sarah Chen',
    userAvatar: 'SC',
    userDepartment: 'Engineering',
    content: "Based on the current sprint velocity, we're tracking well. The main risk is the payment integration - it's about 70% done.",
    createdAt: '2025-01-28T10:30:00Z',
    likes: 12,
  },
  {
    id: 'comment-2',
    marketId: 'prod-1',
    userId: 'user-3',
    userName: 'Mike Johnson',
    userAvatar: 'MJ',
    userDepartment: 'Product',
    content: "I've been in the standup meetings - the team seems confident but there's scope creep happening with the dashboard redesign.",
    createdAt: '2025-01-29T14:15:00Z',
    likes: 8,
  },
  {
    id: 'comment-3',
    marketId: 'prod-1',
    userId: 'user-1',
    userName: 'Demo User',
    userAvatar: 'DU',
    userDepartment: 'Engineering',
    content: 'The QA team just flagged 3 P1 bugs. This might push us close to the deadline.',
    createdAt: '2025-01-30T09:00:00Z',
    likes: 5,
  },
  // Comments for sales-1
  {
    id: 'comment-4',
    marketId: 'sales-1',
    userId: 'user-4',
    userName: 'David Park',
    userAvatar: 'DP',
    userDepartment: 'Sales',
    content: "Just got off a call with their procurement team. They're comparing us to 2 other vendors but we're in good position. Legal review starts next week.",
    createdAt: '2025-01-27T16:45:00Z',
    likes: 15,
  },
  {
    id: 'comment-5',
    marketId: 'sales-1',
    userId: 'user-2',
    userName: 'Sarah Chen',
    userAvatar: 'SC',
    userDepartment: 'Engineering',
    content: "Their CTO asked detailed questions about our API rate limits. I think the technical evaluation went well.",
    createdAt: '2025-01-28T11:20:00Z',
    likes: 7,
  },
  // Comments for hire-1
  {
    id: 'comment-6',
    marketId: 'hire-1',
    userId: 'user-3',
    userName: 'Mike Johnson',
    userAvatar: 'MJ',
    userDepartment: 'Product',
    content: "Heard through the grapevine that one finalist withdrew. Not looking good for the March deadline.",
    createdAt: '2025-01-26T13:00:00Z',
    likes: 9,
  },
];

export function getCommentsByMarketId(marketId: string): Comment[] {
  return DEMO_COMMENTS.filter(c => c.marketId === marketId);
}

export function getUserById(userId: string): User | undefined {
  return DEMO_USERS.find(u => u.id === userId);
}

export function getCurrentUser(): User {
  return DEMO_USERS[0];
}

export function getUserPositions(): Position[] {
  return DEMO_POSITIONS;
}
