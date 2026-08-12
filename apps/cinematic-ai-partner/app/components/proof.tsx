'use client';

import { Reveal } from './reveal';

interface OutcomeCard {
  label: string;
  title: string;
  description: string;
}

const outcomes: OutcomeCard[] = [
  {
    label: 'Acquire',
    title: 'New pipelines, opened by agents',
    description:
      'Research-driven outreach powered by Grok and custom agent workflows. We identify high-signal prospects, craft context-aware messaging, and put warm leads in your pipeline — not spam in theirs.',
  },
  {
    label: 'Grow',
    title: 'Revenue you can measure',
    description:
      'Full-stack site builds, conversion audits, and SEO infrastructure that compounds. We ship production pages — not decks about pages — and tie every change to a growth metric.',
  },
  {
    label: 'Cut',
    title: 'Glue work, eliminated',
    description:
      'Workflow automation, ops audits, and agent-orchestrated processes that replace the duct tape. We find the manual loops your team runs daily and turn them into reliable systems.',
  },
];

export function Proof() {
  return (
    <section className="section-padding" aria-labelledby="proof-heading">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-[0.2em] text-accent-muted">
            Outcomes
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="proof-heading"
            className="text-center font-display text-3xl font-normal leading-tight text-text-primary md:text-4xl"
          >
            Three things we deliver.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {outcomes.map((card, i) => (
            <Reveal key={card.label} delay={0.15 * (i + 1)}>
              <article className="group flex h-full flex-col rounded-2xl border border-white/5 bg-surface-secondary p-7 transition-colors hover:border-accent/20">
                <span className="mb-4 inline-block w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                  {card.label}
                </span>
                <h3 className="font-display text-xl font-normal leading-snug text-text-primary">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                  {card.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
