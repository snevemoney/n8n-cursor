'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Sparkles, Loader2 } from 'lucide-react';
import { PageLoadingBar } from '@/components/scorpion';

const agentTemplates = [
  {
    id: 'content',
    name: 'Content Creator',
    description: 'Generates blog posts, social media content, and marketing materials',
    icon: '✍️',
    features: ['Blog writing', 'Social media posts', 'SEO optimization']
  },
  {
    id: 'research',
    name: 'Research Assistant',
    description: 'Conducts research and summarizes findings from multiple sources',
    icon: '🔍',
    features: ['Web research', 'Document analysis', 'Summary generation']
  },
  {
    id: 'scaffold',
    name: 'SaaS Scaffold',
    description: 'Generates boilerplate code for SaaS applications',
    icon: '🏗️',
    features: ['Code generation', 'Project structure', 'API scaffolding']
  },
  {
    id: 'support',
    name: 'Support Agent',
    description: 'Handles customer support inquiries and tickets',
    icon: '💬',
    features: ['Ticket handling', 'FAQ responses', 'Escalation logic']
  },
  {
    id: 'onboarding',
    name: 'Onboarding Agent',
    description: 'Guides new users through setup and onboarding',
    icon: '👋',
    features: ['User guidance', 'Tutorial generation', 'Progress tracking']
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Analyzes data and generates insights and reports',
    icon: '📊',
    features: ['Data analysis', 'Report generation', 'Trend detection']
  }
];

export default function CreateAgentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedTemplate || !agentName.trim()) return;

    setIsCreating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCreating(false);
    
    // In real app, redirect to agent page
    alert(`Agent "${agentName}" created successfully!`);
  };

  return (
    <>
      <PageLoadingBar loading={isCreating} />
      <div className="h-full flex flex-col overflow-y-auto bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agents"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center text-white">
              <Sparkles className="h-8 w-8 mr-3 text-emerald-400" />
              Create New Agent
            </h1>
            <p className="text-white/60">
              Choose a template and customize your AI agent
            </p>
          </div>
        </div>

        {/* Step 1: Select Template */}
        {!selectedTemplate && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-white">Step 1: Choose a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors text-white">
                    {template.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/5 rounded text-xs text-white/70"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configure Agent */}
        {selectedTemplate && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-white/60 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 max-w-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-white">Step 2: Configure Your Agent</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Awesome Agent"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Template Selected
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {agentTemplates.find(t => t.id === selectedTemplate)?.icon}
                      </span>
                      <div>
                        <div className="font-medium text-white">
                          {agentTemplates.find(t => t.id === selectedTemplate)?.name}
                        </div>
                        <div className="text-sm text-white/60">
                          {agentTemplates.find(t => t.id === selectedTemplate)?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="What will this agent do?"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={handleCreate}
                    disabled={!agentName.trim() || isCreating}
                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-white/5 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center border border-emerald-400/30 disabled:border-white/10 text-emerald-300 disabled:text-white/40"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Create Agent
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      setAgentName('');
                    }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors border border-white/10 text-white/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

