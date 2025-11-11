'use client';

import { useState } from 'react';
import { Panel } from '@/components/scorpion';
import { CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { PageLoadingBar } from '@/components/scorpion';

export default function MistakeLearningPage() {
  const [originalInput, setOriginalInput] = useState('');
  const [wrongOutput, setWrongOutput] = useState('');
  const [correctedOutput, setCorrectedOutput] = useState('');
  const [correction, setCorrection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/chat/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalInput,
          wrongOutput,
          correctedOutput,
          correction: correction || 'User correction'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setOriginalInput('');
        setWrongOutput('');
        setCorrectedOutput('');
        setCorrection('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to submit correction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit correction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageLoadingBar loading={submitting} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Mistake Learning">
        <div className="mb-4">
          <p className="text-sm text-white/60">
            Help Scorpion learn from mistakes by submitting corrections. This improves future responses through automatic fine-tuning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="original-input" className="block text-sm font-medium mb-2">
              Original Question/Input
            </label>
            <textarea
              id="original-input"
              value={originalInput}
              onChange={(e) => setOriginalInput(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
              placeholder="What was the original question or input?"
            />
          </div>

          <div>
            <label htmlFor="wrong-output" className="block text-sm font-medium mb-2">
              Wrong Output (What Scorpion said)
            </label>
            <textarea
              id="wrong-output"
              value={wrongOutput}
              onChange={(e) => setWrongOutput(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
              placeholder="What incorrect response did Scorpion give?"
            />
          </div>

          <div>
            <label htmlFor="corrected-output" className="block text-sm font-medium mb-2">
              Corrected Output (What it should have said)
            </label>
            <textarea
              id="corrected-output"
              value={correctedOutput}
              onChange={(e) => setCorrectedOutput(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
              placeholder="What should the correct response have been?"
            />
          </div>

          <div>
            <label htmlFor="correction-explanation" className="block text-sm font-medium mb-2">
              Correction Explanation (Optional)
            </label>
            <textarea
              id="correction-explanation"
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
              placeholder="Explain what was wrong and why (optional)"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-sm text-emerald-400" role="alert">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              Correction recorded and learned! Scorpion will use this to improve future responses.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !originalInput || !wrongOutput || !correctedOutput}
            className="w-full px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
            aria-label={submitting ? 'Submitting correction' : 'Submit correction'}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Submitting...' : 'Submit Correction'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h2 className="text-sm font-medium mb-2">How Mistake Learning Works</h2>
          <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
            <li>Corrections are automatically added to training data</li>
            <li>High-quality corrections trigger immediate learning</li>
            <li>Mistakes are analyzed to prevent similar errors</li>
            <li>Fine-tuning happens automatically with Ollama</li>
            <li>Your corrections improve Scorpion for everyone</li>
          </ul>
        </div>
      </Panel>
      </div>
    </>
  );
}

