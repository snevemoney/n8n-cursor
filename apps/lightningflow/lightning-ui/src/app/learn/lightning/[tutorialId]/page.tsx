import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TutorialPlayer from '@/components/ui/tutorial-player';

interface TutorialData {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoUrl: string;
  tooltips: Array<{
    id: string;
    x: number;
    y: number;
    timestamp?: number;
    title: string;
    text: string;
    embeddingId?: string;
    source?: string;
  }>;
  relatedResources?: Array<{
    title: string;
    url: string;
    type: 'docs' | 'video' | 'guide';
  }>;
}

// Tutorial configurations with tooltips and metadata
const tutorials: Record<string, TutorialData> = {
  'basics': {
    id: 'basics',
    title: 'Lightning Network Basics',
    description: 'Understanding channels, routing, and payment flows in the Lightning Network',
    duration: '15 min',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=rrr_zPmEiME',
    tooltips: [
      {
        id: 'channel-concept',
        x: 25,
        y: 30,
        timestamp: 45,
        title: 'Payment Channels',
        text: 'Payment channels are the fundamental building blocks of Lightning. They allow two parties to transact off-chain.',
        embeddingId: 'emb_channel_basics_1',
        source: '/docs/channels/basics'
      },
      {
        id: 'routing-explanation',
        x: 70,
        y: 40,
        timestamp: 120,
        title: 'Lightning Routing',
        text: 'Payments are routed through multiple channels to reach their destination, similar to internet packet routing.',
        embeddingId: 'emb_routing_basics_1',
        source: '/docs/routing/fundamentals'
      },
      {
        id: 'htlc-concept',
        x: 50,
        y: 60,
        timestamp: 180,
        title: 'Hash Time-Locked Contracts (HTLCs)',
        text: 'HTLCs ensure secure payment routing by locking funds until payment proof is provided.',
        embeddingId: 'emb_htlc_basics_1',
        source: '/docs/htlcs/overview'
      }
    ],
    relatedResources: [
      {
        title: 'Lightning Network Whitepaper',
        url: 'https://lightning.network/lightning-network-paper.pdf',
        type: 'docs'
      },
      {
        title: 'Channel Management Guide',
        url: '/guides/channel-management',
        type: 'guide'
      }
    ]
  },
  'loop-out': {
    id: 'loop-out',
    title: 'Loop Out Operations',
    description: 'Creating inbound liquidity with submarine swaps using Lightning Loop',
    duration: '20 min',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    tooltips: [
      {
        id: 'inbound-liquidity',
        x: 30,
        y: 25,
        timestamp: 60,
        title: 'Inbound Liquidity',
        text: 'Inbound liquidity is the capacity for others to send you payments through Lightning channels.',
        embeddingId: 'emb_liquidity_inbound_1',
        source: '/docs/liquidity/inbound'
      },
      {
        id: 'submarine-swap',
        x: 65,
        y: 45,
        timestamp: 150,
        title: 'Submarine Swaps',
        text: 'Submarine swaps move funds from Lightning to on-chain Bitcoin, creating inbound liquidity.',
        embeddingId: 'emb_swaps_submarine_1',
        source: '/docs/swaps/submarine'
      },
      {
        id: 'loop-out-process',
        x: 45,
        y: 70,
        timestamp: 240,
        title: 'Loop Out Process',
        text: 'Loop Out sends Lightning funds off-chain to receive on-chain Bitcoin, rebalancing your channels.',
        embeddingId: 'emb_loop_out_process_1',
        source: '/docs/loop/out'
      }
    ],
    relatedResources: [
      {
        title: 'Lightning Loop Documentation',
        url: 'https://docs.lightning.engineering/lightning-network-tools/loop',
        type: 'docs'
      },
      {
        title: 'Liquidity Management Best Practices',
        url: '/guides/liquidity-management',
        type: 'guide'
      }
    ]
  },
  'troubleshooting': {
    id: 'troubleshooting',
    title: 'Error Troubleshooting',
    description: 'Diagnosing and fixing common Lightning Network issues',
    duration: '25 min',
    difficulty: 'Advanced',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    tooltips: [
      {
        id: 'payment-failures',
        x: 35,
        y: 20,
        timestamp: 90,
        title: 'Payment Failures',
        text: 'Common reasons payments fail include insufficient liquidity, routing issues, or fee problems.',
        embeddingId: 'emb_failures_payment_1',
        source: '/docs/troubleshooting/payments'
      },
      {
        id: 'channel-force-close',
        x: 60,
        y: 50,
        timestamp: 180,
        title: 'Force Channel Closure',
        text: 'When channels become unresponsive, force closure broadcasts the latest state to the blockchain.',
        embeddingId: 'emb_channels_force_close_1',
        source: '/docs/channels/force-close'
      },
      {
        id: 'fee-estimation',
        x: 40,
        y: 75,
        timestamp: 270,
        title: 'Fee Estimation Issues',
        text: 'Incorrect fee estimation can cause loop operations to fail or get stuck in mempool.',
        embeddingId: 'emb_fees_estimation_1',
        source: '/docs/fees/estimation'
      }
    ],
    relatedResources: [
      {
        title: 'Lightning Network Troubleshooting Guide',
        url: '/guides/troubleshooting',
        type: 'guide'
      },
      {
        title: 'AI-Powered Error Analysis',
        url: '/ai-assistant',
        type: 'guide'
      }
    ]
  }
};

interface TutorialPageProps {
  params: Promise<{
    tutorialId: string;
  }>;
}

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tutorial = tutorials[resolvedParams.tutorialId];
  
  if (!tutorial) {
    return {
      title: 'Tutorial Not Found',
      description: 'The requested tutorial could not be found.'
    };
  }

  return {
    title: tutorial.title,
    description: tutorial.description
  };
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const resolvedParams = await params;
  const tutorial = tutorials[resolvedParams.tutorialId];

  if (!tutorial) {
    notFound();
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/learn/lightning">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">{tutorial.title}</h1>
          <Badge className={getDifficultyColor(tutorial.difficulty)}>
            {tutorial.difficulty}
          </Badge>
        </div>

        <p className="text-lg text-gray-600">{tutorial.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{tutorial.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{tutorial.difficulty} Level</span>
          </div>
        </div>
      </div>

      {/* Tutorial Player */}
      <TutorialPlayer
        videoUrl={tutorial.videoUrl}
        tooltips={tutorial.tooltips}
        title={tutorial.title}
        onProgress={(progress) => {
          // Could track viewing progress here
          console.log('Tutorial progress:', progress);
        }}
      />

      {/* Related Resources */}
      {tutorial.relatedResources && tutorial.relatedResources.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Related Resources</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {tutorial.relatedResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target={resource.url.startsWith('http') ? '_blank' : '_self'}
                rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{resource.title}</div>
                  <div className="text-xs text-gray-500 capitalize">{resource.type}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Link href="/learn/lightning">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Tutorials
          </Button>
        </Link>
        <Link href="/simulator">
          <Button>
            Try in Simulator
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
} 