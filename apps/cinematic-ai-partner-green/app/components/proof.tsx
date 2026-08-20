'use client';

import { Reveal } from './reveal';

interface OutcomeChapter {
  number: string;
  label: string;
  title: string;
  description: string;
}

const outcomes: OutcomeChapter[] = [
  {
    number: '01',
    label: 'Acquire',
    title: 'Warm doors, not a blast.',
    description:
      'We find the leak — book, apply, contact — and put a real conversation in front of the owner. Research and outreach stay on a named bench, with a human on the send.',
  },
  {
    number: '02',
    label: 'Grow',
    title: 'Pages that feel directed.',
    description:
      'Audit first. Cinematic rebuild when the site itself is the constraint. Production pages, not decks about pages — tied to a metric you can point at.',
  },
  {
    number: '03',
    label: 'Cut',
    title: 'Glue work, ended.',
    description:
      'The loops your team reruns every week become a system. Agents draft. A human stays on the dangerous step. No duct-tape dashboard.',
  },
];

export function Proof() {
  return (
    <section className="section-padding" aria-labelledby="proof-heading">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-text-muted">
            Outcomes
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="proof-heading"
            className="max-w-xl font-display text-3xl font-normal leading-tight text-text md:text-5xl"
          >
            Three beats. One desk.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mt-12 h-36 overflow-hidden md:h-48">
            <img
              src="/proof/broll-light-leak.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <img
              src="/proof/broll-glass-planes.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-30"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, var(--bg), transparent 30%, transparent 70%, var(--bg))',
              }}
            />
          </div>
        </Reveal>

        <div className="mt-4">
          {outcomes.map((chapter, i) => (
            <Reveal key={chapter.label} delay={0.08 * (i + 1)}>
              <article className="grid gap-6 border-t border-line py-12 md:grid-cols-[7rem_1fr] md:gap-12">
                <span
                  className="font-display text-5xl leading-none text-accent/35 md:text-6xl"
                  aria-hidden="true"
                >
                  {chapter.number}
                </span>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                    {chapter.label}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-normal leading-snug text-text md:text-3xl">
                    {chapter.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
                    {chapter.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
