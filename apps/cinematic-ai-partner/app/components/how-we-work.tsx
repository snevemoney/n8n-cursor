'use client';

import { Reveal } from './reveal';

const steps = [
  {
    number: '01',
    title: 'Listen',
    body: 'We sit in your standups, read your dashboards, and map the real bottlenecks — not the ones on the roadmap slide.',
  },
  {
    number: '02',
    title: 'Architect',
    body: 'A small agent team is configured for your stack: research agents, build agents, audit agents — each with a bounded scope and a human checkpoint.',
  },
  {
    number: '03',
    title: 'Ship & measure',
    body: 'We deliver production assets — pages, automations, campaigns — and tie each one to the metric you care about. No vanity deliverables.',
  },
  {
    number: '04',
    title: 'Iterate',
    body: 'Weekly retros surface what the agents got right and where the operator course-corrected. The system gets sharper every cycle.',
  },
];

export function HowWeWork() {
  return (
    <section className="section-padding" aria-labelledby="how-heading">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-[0.2em] text-accent-muted">
            How we work
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            id="how-heading"
            className="mx-auto max-w-2xl text-center font-display text-3xl font-normal leading-tight text-text-primary md:text-4xl"
          >
            A focused operator. Purpose-built agents.
            <br className="hidden md:block" />
            One accountable team.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-text-secondary">
            You don&apos;t hire a department — you gain a partner who brings the
            right agents to each problem and owns the outcome end-to-end.
          </p>
        </Reveal>

        <div className="mt-16 space-y-0">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={0.1 * (i + 1)}>
              <div className="group flex gap-6 border-l border-white/10 py-8 pl-8 transition-colors hover:border-accent/30">
                <span className="shrink-0 font-display text-2xl text-accent/50 transition-colors group-hover:text-accent">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
