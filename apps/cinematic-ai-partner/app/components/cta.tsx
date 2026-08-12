'use client';

import { Reveal } from './reveal';
import { siteConfig } from '../config';

export function CTA() {
  return (
    <section className="section-padding" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2
            id="cta-heading"
            className="font-display text-3xl font-normal leading-tight text-text-primary md:text-5xl"
          >
            Ready to stop managing tools
            <br className="hidden md:block" />
            and start shipping outcomes?
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            One conversation to see if we&apos;re the right fit. No pitch deck —
            just a candid look at where agents can move the needle for your team.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10">
            <a
              href={siteConfig.ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-semibold text-surface-primary transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary"
            >
              {siteConfig.ctaLabel}
              <span aria-hidden="true">&rarr;</span>
            </a>
            <p className="mt-4 text-xs text-text-muted">
              No commitment. 30-minute call.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
