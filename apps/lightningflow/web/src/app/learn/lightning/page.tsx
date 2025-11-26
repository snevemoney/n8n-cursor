import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Zap, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lightning Network Tutorials',
  description: 'Interactive Lightning Network tutorials with video guides and tooltips'
};

const tutorials = [
  {
    id: 'basics',
    title: 'Lightning Network Basics',
    description: 'Understanding channels, routing, and payment flows',
    duration: '15 min',
    difficulty: 'Beginner',
    videoUrl: 'https://www.youtube.com/watch?v=rrr_zPmEiME', // Example URL
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 'loop-out',
    title: 'Loop Out Operations',
    description: 'Creating inbound liquidity with submarine swaps',
    duration: '20 min',
    difficulty: 'Intermediate',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    icon: <Layers className="h-6 w-6" />,
  },
  {
    id: 'troubleshooting',
    title: 'Error Troubleshooting',
    description: 'Diagnosing and fixing common Lightning issues',
    duration: '25 min',
    difficulty: 'Advanced',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    icon: <BookOpen className="h-6 w-6" />,
  },
];

export default function LightningTutorialsPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {tutorial.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <div className="flex gap-2 text-sm text-gray-500">
                    <span>{tutorial.duration}</span>
                    <span>•</span>
                    <span>{tutorial.difficulty}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {tutorial.description}
              </CardDescription>
              <Link href={`/learn/lightning/${tutorial.id}`}>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Tutorial
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Interactive Learning</h2>
        <p className="text-gray-600 mb-4">
          Our tutorials feature interactive tooltips, real-time feedback, and direct links to 
          troubleshooting resources when you encounter issues.
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Video Tutorials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Interactive Tooltips</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>AI-Powered Help</span>
          </div>
        </div>
      </div>
    </div>
  );
} 