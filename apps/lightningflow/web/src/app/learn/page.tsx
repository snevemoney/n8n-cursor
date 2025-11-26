import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Zap, Layers, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learning Center',
  description: 'Master Lightning Network operations with interactive tutorials and AI-powered guidance'
};

const learningPaths = [
  {
    id: 'lightning',
    title: 'Lightning Network',
    description: 'Complete guide to Lightning Network operations',
    tutorials: 3,
    duration: '60 min',
    difficulty: 'Beginner to Advanced',
    icon: <Zap className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-600',
    href: '/learn/lightning'
  },
  {
    id: 'troubleshooting',
    title: 'Error Troubleshooting',
    description: 'AI-powered error analysis and resolution',
    tutorials: 5,
    duration: '45 min',
    difficulty: 'Intermediate',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'bg-red-100 text-red-600',
    href: '/learn/troubleshooting'
  },
  {
    id: 'advanced',
    title: 'Advanced Operations',
    description: 'Channel management and liquidity optimization',
    tutorials: 4,
    duration: '90 min',
    difficulty: 'Advanced',
    icon: <Layers className="h-8 w-8" />,
    color: 'bg-purple-100 text-purple-600',
    href: '/learn/advanced'
  }
];

const features = [
  {
    title: 'Interactive Video Tutorials',
    description: 'Watch and learn with context-aware tooltips that appear at the right moment',
    icon: <Play className="h-6 w-6" />
  },
  {
    title: 'AI-Powered Feedback',
    description: 'Rate tutorial content to help improve the learning experience for everyone',
    icon: <Zap className="h-6 w-6" />
  },
  {
    title: 'Smart Error Linking',
    description: 'When you encounter errors, get direct links to relevant tutorial sections',
    icon: <BookOpen className="h-6 w-6" />
  }
];

export default function LearnPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Lightning Network Learning Center
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Master Lightning Network operations with interactive tutorials, AI-powered guidance, 
          and real-time feedback. Learn by doing with our comprehensive educational platform.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Learning Paths</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${path.color}`}>
                    {path.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <div className="flex gap-2 text-sm text-gray-500">
                      <span>{path.tutorials} tutorials</span>
                      <span>•</span>
                      <span>{path.duration}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {path.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {path.difficulty}
                  </span>
                  <Link href={path.href}>
                    <Button>
                      Start Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Interactive Learning Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              New to Lightning Network?
            </h3>
            <p className="text-gray-600">
              Start with our beginner-friendly Lightning Network basics tutorial
            </p>
          </div>
          <Link href="/learn/lightning/basics">
            <Button size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Tutorial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 