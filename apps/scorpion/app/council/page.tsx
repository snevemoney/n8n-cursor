'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare, Loader2 } from 'lucide-react';

interface CouncilMember {
  name: string;
  role: string;
  specialty: string;
  weight: number;
  goal: string;
  reply?: string;
}

interface CouncilResult {
  members: CouncilMember[];
  consensus: {
    score: number;
    summary: string;
  };
}

export default function CouncilPage() {
  const [topic, setTopic] = useState("How should we integrate the local model?");
  const [result, setResult] = useState<CouncilResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<CouncilMember[]>([]);

  useEffect(() => {
    // Load council members
    fetch('/api/council')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(err => console.error('Failed to load members:', err));
  }, []);

  async function runCouncil() {
    if (!topic.trim() || loading) return;
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!res.ok) {
        throw new Error('Failed to run council');
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error running council:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <Users className="h-8 w-8 mr-3 text-purple-400" />
            Scorpion Council
          </h1>
          <p className="text-gray-400">
            Multi-agent deliberation system for intelligent decision-making
          </p>
        </div>

        {/* Council Members Overview */}
        {members.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4">Council Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {members.map((member) => (
                <div key={member.name} className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-400">{member.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{member.specialty}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    Weight: {member.weight}x
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hold a Council Meeting</h2>
          <div className="space-y-4">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should the council deliberate on? (e.g., 'Should we deploy the new feature now?')"
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              rows={4}
              disabled={loading}
            />
            <button
              onClick={runCouncil}
              disabled={!topic.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Consulting council...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Run Council
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Consensus */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Consensus</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-4xl font-bold text-purple-400">
                    {result.consensus.score}/10
                  </span>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap text-gray-300">
                    {result.consensus.summary}
                  </pre>
                </div>
              </div>
            </div>

            {/* Member Responses */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Council Deliberation</h2>
              <div className="space-y-4">
                {result.members.map((member, idx) => (
                  <details
                    key={idx}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <summary className="cursor-pointer font-semibold text-lg mb-2 flex items-center justify-between">
                      <span>
                        {member.name} — {member.role}
                      </span>
                      <span className="text-sm text-gray-400 font-normal">
                        Weight: {member.weight}x
                      </span>
                    </summary>
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-gray-400">
                        <strong>Specialty:</strong> {member.specialty}
                      </div>
                      <div className="text-sm text-gray-400">
                        <strong>Goal:</strong> {member.goal}
                      </div>
                      <div className="mt-4 bg-gray-800/50 rounded p-3">
                        <pre className="text-sm whitespace-pre-wrap text-gray-300">
                          {member.reply}
                        </pre>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

