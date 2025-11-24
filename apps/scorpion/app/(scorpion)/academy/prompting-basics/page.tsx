'use client';

import Link from 'next/link';

export default function PromptingBasicsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase text-neutral-400 tracking-wide">
          Scorpion Academy
        </p>
        <h1 className="text-2xl font-bold mt-1">
          Prompting Basics: The 5 Elements of a Powerful Prompt
        </h1>
        <p className="text-neutral-300 mt-2 text-sm">
          How to write high-quality prompts for Scorpion and other AI systems.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">The 5 Elements of a Strong Prompt</h2>
        <div className="space-y-2">
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">1. Role</p>
            <p className="text-xs text-neutral-300">
              Specify who Scorpion should act as: &quot;Act as a developer&quot;, &quot;You are a financial advisor&quot;, etc.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">2. Context</p>
            <p className="text-xs text-neutral-300">
              Provide key background, constraints, and relevant information that affects the task.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">3. Request</p>
            <p className="text-xs text-neutral-300">
              Clearly state what you want done. Use action verbs: create, analyze, find, build, generate, etc.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">4. Structure</p>
            <p className="text-xs text-neutral-300">
              Specify the output format: bullet list, steps, table, JSON, markdown, summary, etc.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">5. Example</p>
            <p className="text-xs text-neutral-300">
              Provide an example of the style, tone, structure, or format you want.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">Example: Weak vs Strong Prompt</h2>
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <p className="text-xs font-semibold text-red-400 mb-1">❌ Weak Prompt</p>
            <p className="text-xs text-neutral-300">
              &quot;Make it better&quot;
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Too vague. No context, no structure, no clear request.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
            <p className="text-xs font-semibold text-emerald-400 mb-1">✅ Strong Prompt</p>
            <p className="text-xs text-neutral-300">
              &quot;Act as a senior developer. I have a React component with performance issues. 
              Analyze the code, identify bottlenecks, and provide a refactored version with 
              explanations. Format as: (1) Issues found, (2) Refactored code, (3) Performance improvements. 
              Example style: concise, technical, with code comments.&quot;
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Includes role, context, request, structure, and example style.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">5 Conversational Refinement Techniques</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            <strong>Feedback:</strong> Tell Scorpion what worked and what didn&apos;t, then ask for a revision.
          </li>
          <li>
            <strong>Variations:</strong> Ask for multiple versions or approaches to the same problem.
          </li>
          <li>
            <strong>Clarification:</strong> Ask Scorpion to clarify its reasoning or ask you questions.
          </li>
          <li>
            <strong>Version-keep:</strong> Tell Scorpion what parts to keep unchanged while changing others.
          </li>
          <li>
            <strong>Add context:</strong> Provide additional information as the conversation evolves.
          </li>
        </ol>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">Break It Down Principle</h2>
        <p>
          Large, complicated prompts should be decomposed into smaller requests.
          Scorpion can guide you through multi-step workflows.
        </p>
        <div className="bg-neutral-800/50 rounded p-3 mt-2">
          <p className="text-xs text-neutral-300">
            <strong>Instead of:</strong> &quot;Build a complete e-commerce platform with payment, inventory, and analytics&quot;
            <br />
            <strong>Try:</strong> &quot;Let&apos;s start with the product catalog. First, design the database schema for products.&quot;
          </p>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="text-lg font-semibold">How Scorpion Helps</h2>
        <p>
          The Prompt Quality Council automatically detects when prompts are missing key elements
          and suggests improvements. Check the Council tab to see its recommendations in real-time.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mt-2">
          <p className="text-xs text-emerald-300">
            <strong>💡 Tip:</strong> When you see Prompt Quality issues in the Council tab,
            follow the recommendations to improve your prompt and get better results.
          </p>
        </div>
      </section>

      <div className="border-t border-neutral-700 pt-4">
        <Link
          href="/academy/ai-foundations"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to AI Foundations
        </Link>
      </div>
    </div>
  );
}

