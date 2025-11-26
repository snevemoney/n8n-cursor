export const mockNodeData = {
  balance: {
    sats: 23540,
    usd: 9.89
  },
  channels: {
    total: 5,
    active: 4,
    pending: 1
  },
  feeRate: {
    percent: 0.25,
    description: "Competitive market rate"
  },
  earnings: {
    routing: {
      sats: 8239,
      usd: 3.40
    },
    sales: {
      sats: 15301,
      usd: 6.43
    },
    monthlyProjection: {
      sats: 28248,
      usd: 11.88
    }
  },
  details: {
    nodeId: "03c7e9cf1556455ddbca475228c375bb537639835ea745644c32f437d52a2da6",
    softwareVersion: "v0.16.0",
    type: "managed",
    connectedPeers: 15
  }
};

export const mockTeamWallets = [
  {
    email: "alice@example.com",
    role: "Admin",
    balance: 150000,
    status: "Active",
    avatar: "A",
    permissions: {
      canWithdraw: true,
      canReceive: true,
      canManageTeam: true,
      canCreateInvoices: true
    },
    spendingLimit: {
      daily: 50000,
      monthly: 500000,
      remaining: {
        daily: 35000,
        monthly: 350000
      }
    },
    activity: {
      lastActive: "2 hours ago",
      recentTransactions: 5
    },
    walletSharing: [
      { id: "marketing-budget", name: "Marketing Budget", accessLevel: "Owner" },
      { id: "operations", name: "Operations", accessLevel: "Owner" }
    ]
  },
  {
    email: "bob@example.com",
    role: "Designer",
    balance: 75000,
    status: "Active",
    avatar: "B",
    permissions: {
      canWithdraw: true,
      canReceive: true,
      canManageTeam: false,
      canCreateInvoices: true
    },
    spendingLimit: {
      daily: 25000,
      monthly: 200000,
      remaining: {
        daily: 15000,
        monthly: 125000
      }
    },
    activity: {
      lastActive: "1 day ago",
      recentTransactions: 2
    },
    walletSharing: [
      { id: "marketing-budget", name: "Marketing Budget", accessLevel: "Editor" }
    ]
  },
  {
    email: "charlie@example.com",
    role: "Developer",
    balance: 0,
    status: "Pending",
    avatar: "C",
    permissions: {
      canWithdraw: false,
      canReceive: true,
      canManageTeam: false,
      canCreateInvoices: false
    },
    spendingLimit: {
      daily: 10000,
      monthly: 100000,
      remaining: {
        daily: 10000,
        monthly: 100000
      }
    },
    activity: {
      lastActive: "Never",
      recentTransactions: 0
    },
    walletSharing: []
  },
  {
    email: "dave@example.com",
    role: "Marketing Manager",
    balance: 120000,
    status: "Active",
    avatar: "D",
    permissions: {
      canWithdraw: true,
      canReceive: true,
      canManageTeam: false,
      canCreateInvoices: true
    },
    spendingLimit: {
      daily: 30000,
      monthly: 250000,
      remaining: {
        daily: 20000,
        monthly: 130000
      }
    },
    activity: {
      lastActive: "5 hours ago",
      recentTransactions: 3
    },
    walletSharing: [
      { id: "marketing-budget", name: "Marketing Budget", accessLevel: "Editor" },
      { id: "content-creation", name: "Content Creation", accessLevel: "Owner" }
    ]
  }
];

export const mockPaymentLinks = [
  {
    id: '1',
    description: 'Video Editing for ClientCo',
    amount: 50000,
    date: '05/15/2024',
    time: '3:30 PM',
    status: 'pending',
    method: 'lightning'
  },
  {
    id: '2',
    description: 'Logo Design',
    amount: 120000,
    date: '05/12/2024',
    time: '10:15 AM',
    status: 'completed',
    method: 'bank'
  },
  {
    id: '3',
    description: 'Website Consultation',
    amount: 75000,
    date: '05/10/2024',
    time: '2:45 PM',
    status: 'completed',
    method: 'credit'
  },
  {
    id: '4',
    description: 'Podcast Production',
    amount: 200000,
    date: '05/05/2024',
    time: '11:00 AM',
    status: 'pending',
    method: 'lightning'
  }
];

export const mockAnalyticsData = {
  nodeUptime: {
    current: 99.2,
    history: [true, true, true, true, false, true, true],
    lostRevenue: 550
  },
  routing: {
    totalFees: 23500,
    volumeForwarded: 4250000,
    htlcSuccessRate: 98.7,
    peerRevenue: [
      { name: "ACINQ", revenue: 9200, forwards: 78, volume: 1250000 },
      { name: "Bitfinex", revenue: 5400, forwards: 45, volume: 950000 },
      { name: "River", revenue: 4100, forwards: 34, volume: 750000 },
      { name: "Voltage", revenue: 2500, forwards: 25, volume: 550000 },
      { name: "Breez", revenue: 1800, forwards: 18, volume: 350000 }
    ]
  },
  channels: [
    {
      name: "ACINQ",
      capacity: 1000000,
      localBalance: 95,
      remoteBalance: 5,
      feeRate: 500,
      feeBase: 1,
      uptime: 99.8,
      score: 72,
      status: "Rebalance"
    },
    {
      name: "Bitfinex",
      capacity: 1000000,
      localBalance: 20,
      remoteBalance: 80,
      feeRate: 800,
      feeBase: 1,
      uptime: 99.9,
      score: 88,
      status: "Healthy"
    }
  ]
}; 