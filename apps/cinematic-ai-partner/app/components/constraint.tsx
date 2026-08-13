'use client';

import { Reveal } from './reveal';

const painPoints = [
  'Twelve SaaS tabs open. No single source of truth.',
  'An agent writes the first draft — then a human rewrites the whole thing.',
  'Growth ideas stuck in backlogs because nobody owns the glue.',
];

export function Constraint() {
  return (
    <section className="section-padding" aria-labelledby="constraint-heading">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
            The problem
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="constraint-heading"
            className="font-display text-3xl font-normal leading-tight text-text md:text-4xl"
          >
            Ops sighs here.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 text-lg leading-relaxed text-text-muted">
            Most teams drown in tool-chain chaos. Automations break silently.
            Agents hallucinate without an operator in the loop. Growth stalls
            while you debug connectors.
          </p>
        </Reveal>

        <ul className="mt-12 space-y-6 text-left" role="list">
          {painPoints.map((point, i) => (
            <Reveal key={i} delay={0.15 * (i + 1)}>
              <li className="flex items-start gap-4 border-t border-line py-5">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="text-base leading-relaxed text-text-muted">
                  {point}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
