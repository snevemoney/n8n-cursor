'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, ArrowLeft, CheckCircle, FileCode } from 'lucide-react';

interface BuildPlan {
  name: string;
  description: string;
  architecture: {
    patterns: any[];
    reasoning: string;
  };
  features: {
    knowledge: any[];
    implementation: string;
  }[];
  codeStructure: {
    files: string[];
    dependencies: string[];
  };
  researchNeeded: string[];
}

export default function BuildPage() {
  const [target, setTarget] = useState('');
  const [features, setFeatures] = useState('');
  const [requirements, setRequirements] = useState('');
  const [building, setBuilding] = useState(false);
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = async () => {
    if (!target || !features.trim()) {
      setError('Please fill in target audience and features');
      return;
    }

    setBuilding(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          features: features.split(',').map(f => f.trim()).filter(f => f),
          requirements
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to build side hustle');
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to build side hustle');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Sparkles className="h-8 w-8 mr-3 text-yellow-400" />
              Build New Side Hustle
            </h1>
            <p className="text-gray-400">
              Tell Scorpion what to build. It will use knowledge from existing side hustles to create a plan.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., business owners, developers, content creators"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Features (comma-separated)</label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="e.g., chatbot, multi-tenant, payment processing"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Scorpion will search its knowledge base for these features
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Requirements</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe what this side hustle should do, any specific requirements..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 h-32 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleBuild}
              disabled={building || !target || !features.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {building ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Building Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Build Side Hustle
                </>
              )}
            </button>
          </div>
        </div>

        {/* Build Plan */}
        {plan && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <FileCode className="h-6 w-6 mr-2" />
                Build Plan: {plan.name}
              </h2>
              <p className="text-gray-300 mb-4">{plan.description}</p>
              
              {plan.researchNeeded.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm font-medium mb-2">Research Needed:</p>
                  <ul className="list-disc list-inside text-sm text-yellow-300">
                    {plan.researchNeeded.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Architecture */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-3">Architecture</h3>
              <p className="text-gray-300 mb-4">{plan.architecture.reasoning}</p>
              {plan.architecture.patterns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Patterns Found:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.architecture.patterns.map((pattern, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                        {pattern.title} ({pattern.source})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-3">Features</h3>
              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="bg-gray-700/30 rounded-lg p-4">
                    <p className="font-medium mb-2">{feature.implementation}</p>
                    {feature.knowledge.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Knowledge Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.knowledge.map((k: any, kidx: number) => (
                            <span key={kidx} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                              {k.source}: {k.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Structure */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-semibold mb-3">Code Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Files/Folders:</p>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {plan.codeStructure.files.map((file, idx) => (
                      <li key={idx} className="font-mono">{file}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Dependencies:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.codeStructure.dependencies.map((dep, idx) => (
                      <span key={idx} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

