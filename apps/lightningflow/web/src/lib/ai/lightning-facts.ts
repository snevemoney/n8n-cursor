/**
 * Lightning Network Facts and Educational Content
 * This file serves as the knowledge base for AI Assistant responses
 * about Lightning Network technology, limitations, and security.
 */

export interface LightningFact {
  id: string;
  category: 'scalability' | 'security' | 'limitations' | 'routing' | 'economics';
  title: string;
  content: string;
  source?: string;
  source_url?: string;
  confidence: 'high' | 'medium' | 'low';
  last_updated: string;
}

export const LIGHTNING_FACTS: LightningFact[] = [
  // Scalability Facts
  {
    id: 'ln-vs-visa-tps',
    category: 'scalability',
    title: 'Lightning Network vs Visa TPS Comparison',
    content: 'Visa processes around 4,000 transactions per second on average and can scale up to 65,000 TPS. Bitcoin handles only 7 transactions per second with the current 1MB block size. Lightning Network can theoretically handle millions of TPS through off-chain payment channels.',
    source: 'Visa Factsheet 2017',
    source_url: 'https://usa.visa.com/dam/VCOM/global/about-visa/documents/visa-facts-figures-jan-2017.pdf',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'ln-channel-mechanics',
    category: 'scalability',
    title: 'How Lightning Channels Work',
    content: 'Lightning channels work in three phases: 1) Open Channel - parties lock funds in a multisig address on-chain, 2) Update Balances - they exchange signed balance updates off-chain (instant and nearly free), 3) Close Channel - final state is submitted to Bitcoin blockchain.',
    source: 'CoinJournal Lightning Explanation',
    source_url: 'https://coinjournal.net/a-simple-explanation-of-the-lightning-network/',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'coffee-shop-example',
    category: 'scalability',
    title: 'Real-World Lightning Example',
    content: 'Bob buys coffee every morning. Instead of creating expensive blockchain transactions each time, he opens a Lightning channel with the coffee shop. He deposits 0.05 BTC, the shop deposits nothing. Now Bob can buy hundreds of coffees with instant, cheap payments by simply updating the balance sheet off-chain.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },

  // Security Facts
  {
    id: 'multisig-security',
    category: 'security',
    title: 'Multisignature Wallet Security',
    content: 'Lightning channels use 2-of-2 multisig addresses. Neither party can unilaterally spend funds without the other\'s signature. This ensures funds cannot be stolen without collusion, only the latest state can be broadcast, and revocation keys prevent fraud.',
    source: 'Bitcoin Wiki - Multisignature',
    source_url: 'https://en.bitcoin.it/wiki/Multisignature#Multisignature_Wallets',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'htlc-mechanism',
    category: 'security',
    title: 'Hash Time-Locked Contracts (HTLCs)',
    content: 'HTLCs ensure atomic payments across multiple hops. They use cryptographic hash functions and time locks to guarantee that either the entire payment succeeds or it fails completely, preventing partial payment theft.',
    source: 'Litecoin School Technical Primer',
    source_url: 'https://medium.com/the-litecoin-school-of-crypto/a-primer-to-the-lightning-network-part-1-be909c403bde',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'non-custodial-nature',
    category: 'security',
    title: 'Non-Custodial Bitcoin Control',
    content: 'Lightning Network is non-custodial. Users maintain control of their private keys and Bitcoin. Payment channels are trustless - no third party can steal funds. Only on-chain transactions (opening/closing channels) require blockchain confirmation.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },

  // Routing Facts
  {
    id: 'routing-mechanism',
    category: 'routing',
    title: 'Multi-Hop Payment Routing',
    content: 'You don\'t need direct channels with everyone. Alice can pay the coffee shop through Bob: Alice → Bob → Coffee Shop. The network finds routes with the least intermediates and lowest fees. This reduces blockchain strain but requires intermediates to have sufficient liquidity.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'routing-success-rates',
    category: 'routing',
    title: 'HTLC Success Rates',
    content: 'Well-managed Lightning nodes typically achieve 95-99% HTLC success rates. Success depends on liquidity management, fee policies, and network connectivity. Failed payments don\'t cost money but may require route retries.',
    confidence: 'medium',
    last_updated: '2025-01-28'
  },

  // Limitations Facts
  {
    id: 'fyookball-critique',
    category: 'limitations',
    title: 'Mathematical Critique of Lightning Decentralization',
    content: 'Fyookball\'s 2018 paper argues that "routing is not free — large players will dominate the hubs." This suggests network effects may favor centralized routing hubs over time, potentially reducing decentralization benefits.',
    source: 'Fyookball Mathematical Proof',
    source_url: 'https://medium.com/@jonaldfyookball/mathematical-proof-that-the-lightning-network-cannot-be-a-decentralized-bitcoin-scaling-solution-1b8147650800',
    confidence: 'medium',
    last_updated: '2025-01-28'
  },
  {
    id: 'liquidity-requirements',
    category: 'limitations',
    title: 'Liquidity Management Challenges',
    content: 'Lightning channels require balanced liquidity for bidirectional payments. If a channel becomes unbalanced, payments may fail in one direction. Users need to actively manage liquidity through rebalancing, circular rebalancing, or submarine swaps.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'uptime-requirements',
    category: 'limitations',
    title: 'Node Uptime Requirements',
    content: 'Lightning nodes should maintain high uptime to monitor for fraudulent channel closes and to route payments effectively. Downtime can result in lost routing revenue and potential security risks from stale channel states.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },

  // Economics Facts
  {
    id: 'fee-economics',
    category: 'economics',
    title: 'Lightning Network Fee Structure',
    content: 'Lightning fees consist of a base fee (flat rate per payment) and a fee rate (proportional to payment amount, measured in parts per million - ppm). Typical fees range from 1-1000 ppm (0.0001% to 0.1%) plus 1-1000 sat base fees.',
    confidence: 'high',
    last_updated: '2025-01-28'
  },
  {
    id: 'routing-revenue',
    category: 'economics',
    title: 'Node Routing Revenue Potential',
    content: 'Lightning node operators earn routing fees by forwarding payments. Revenue depends on channel capacity, liquidity management, competitive fee rates, and network position. Well-positioned nodes with good liquidity can earn 0.5-5% annual returns on Bitcoin locked in channels.',
    confidence: 'medium',
    last_updated: '2025-01-28'
  }
];

// Helper functions for AI Assistant integration
export function getLightningFactsByCategory(category: LightningFact['category']): LightningFact[] {
  return LIGHTNING_FACTS.filter(fact => fact.category === category);
}

export function searchLightningFacts(query: string): LightningFact[] {
  const searchTerms = query.toLowerCase().split(' ');
  return LIGHTNING_FACTS.filter(fact => 
    searchTerms.some(term => 
      fact.title.toLowerCase().includes(term) ||
      fact.content.toLowerCase().includes(term)
    )
  );
}

export function getRandomLightningFact(): LightningFact {
  return LIGHTNING_FACTS[Math.floor(Math.random() * LIGHTNING_FACTS.length)];
}

export function formatFactForAssistant(fact: LightningFact): string {
  return `**${fact.title}**
${fact.content}
${fact.source ? `\n*Source: ${fact.source}*` : ''}
${fact.source_url ? `\n*Learn more: ${fact.source_url}*` : ''}
*Confidence: ${fact.confidence}* | *Category: ${fact.category}*`;
} 