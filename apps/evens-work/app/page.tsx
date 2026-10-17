"use client";

import { useEffect } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  Braces,
  CircleDot,
  Film,
  Network,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const projects = [
  {
    number: "01",
    eyebrow: "Personal AI operating system",
    title: "Scorpion",
    statement: "An intelligence layer that remembers, coordinates, and learns.",
    description:
      "A local-first orchestration system connecting persistent memory, RAG knowledge, multi-agent workflows, health monitoring, and human approvals into one operational surface.",
    tags: ["Multi-agent", "RAG memory", "Local-first", "Automation"],
    signal: "Active system",
    Icon: Bot,
    href: "https://github.com/snevemoney/n8n-cursor/tree/main/apps/scorpion",
    accent: "emerald",
    featured: true,
  },
  {
    number: "02",
    eyebrow: "Sovereign finance product",
    title: "LightningFlow",
    statement: "Business operations, rebuilt on intelligent rails.",
    description:
      "A financial operating system for independent businesses—combining Bitcoin Lightning payments, AI-powered automation, queues, dashboards, and real-time operating data.",
    tags: ["Next.js", "Lightning", "AI agents", "Fintech"],
    signal: "Product system",
    Icon: Braces,
    href: "https://github.com/snevemoney/n8n-cursor/tree/main/apps/lightningflow",
    accent: "cyan",
  },
  {
    number: "03",
    eyebrow: "Market intelligence media engine",
    title: "Wealth Intelligence",
    statement: "Research in. A cinematic daily market show out.",
    description:
      "A typed research-to-video engine that turns sourced market intelligence into data-led scenes, voice tracks, portfolio decisions, and a repeatable 1080p daily show.",
    tags: ["Remotion", "Market data", "Voice", "Automation"],
    signal: "1920×1080 · 30 fps",
    Icon: Film,
    href: "https://github.com/snevemoney/n8n-cursor/tree/main/apps/portfolio-brief-remotion",
    accent: "violet",
  },
  {
    number: "04",
    eyebrow: "Cross-platform AI memory",
    title: "Outer Heaven",
    statement: "One continuous brain across four AI surfaces.",
    description:
      "A shared context and session architecture designed to let Cursor, Claude, ChatGPT, and Grok continue the same work without starting from zero.",
    tags: ["ChatGPT", "Claude", "Cursor", "Grok"],
    signal: "4 AI surfaces",
    Icon: Network,
    href: "https://github.com/snevemoney/n8n-cursor/tree/main/docs/hive/outer-heaven",
    accent: "amber",
  },
  {
    number: "05",
    eyebrow: "Automation workbench",
    title: "Workflow Foundry",
    statement: "From loose tasks to observable, repeatable systems.",
    description:
      "A development workbench for workflow synchronization, testing, webhook operations, MCP tooling, and a dashboard spanning 20 connected n8n integrations.",
    tags: ["n8n", "MCP", "Webhooks", "20 integrations"],
    signal: "Operations layer",
    Icon: Workflow,
    href: "https://github.com/snevemoney/n8n-cursor/tree/main/apps/n8n-cursor",
    accent: "rose",
  },
];

const capabilities = [
  "AI orchestration",
  "Product architecture",
  "Workflow automation",
  "Financial intelligence",
  "Agent memory",
  "Creative systems",
  "Infrastructure",
  "Human-in-the-loop design",
];

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    const handlePointerMove = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
      root.style.setProperty(
        "--pointer-ratio-x",
        `${(event.clientX / window.innerWidth - 0.5) * 2}`,
      );
      root.style.setProperty(
        "--pointer-ratio-y",
        `${(event.clientY / window.innerHeight - 0.5) * 2}`,
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <main className="site-shell">
      <div className="ambient-stage" aria-hidden="true">
        <div className="pointer-light" />
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="perspective-grid" />
        <div className="noise-field" />
      </div>

      <div className="site-content">
        <header className="site-header">
          <a className="brand-mark" href="#top" aria-label="Evens Louis — top">
            <span>E</span>
            <i />
            <span>L</span>
          </a>

          <div className="header-meta" aria-label="Portfolio information">
            <span>WORK / 2026</span>
            <span className="header-location">MONTRÉAL, QC</span>
          </div>

          <Button
            asChild
            variant="outline"
            className="contact-button h-11 rounded-full border-white/14 bg-white/[0.035] px-5 text-[0.7rem] font-semibold tracking-[0.16em] text-white hover:border-emerald-300/40 hover:bg-emerald-300/10 hover:text-emerald-100"
          >
            <a href="https://evenslouis.ca">
              START A CONVERSATION
              <ArrowUpRight />
            </a>
          </Button>
        </header>

        <section id="top" className="hero-section" aria-labelledby="hero-title">
          <div className="hero-kicker">
            <span className="live-dot" />
            INDEPENDENT BUILDER · AI SYSTEMS · DIGITAL PRODUCTS
          </div>

          <h1 id="hero-title" className="hero-title">
            <span>I build the layer</span>
            <span className="hero-title-accent">between ideas</span>
            <span>and execution.</span>
          </h1>

          <div className="hero-bottom">
            <p className="hero-intro">
              I&apos;m Evens Louis—an operator and systems builder creating
              intelligent products that turn complexity into leverage.
            </p>

            <a className="scroll-cue" href="#selected-work">
              <span>SELECTED WORK</span>
              <span className="scroll-icon">
                <ArrowDown />
              </span>
            </a>
          </div>

          <div className="hero-index" aria-label="Portfolio summary">
            <div>
              <strong>05</strong>
              <span>SYSTEMS</span>
            </div>
            <div>
              <strong>04</strong>
              <span>AI SURFACES</span>
            </div>
            <div>
              <strong>01</strong>
              <span>OPERATOR</span>
            </div>
            <p>
              BUILT ACROSS AI, FINANCIAL INTELLIGENCE, AUTOMATION, AND
              INFRASTRUCTURE.
            </p>
          </div>
        </section>

        <section id="selected-work" className="work-section" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <span className="section-number">01 / SELECTED WORK</span>
              <h2 id="work-title">Systems with a pulse.</h2>
            </div>
            <p>
              Not isolated demos. Each project is part of a larger operating
              system built to think, create, decide, or execute.
            </p>
          </div>

          <div className="project-grid">
            {projects.map((project) => {
              const Icon = project.Icon;
              return (
                <article
                  className={`project-card project-${project.accent} ${
                    project.featured ? "project-featured" : ""
                  }`}
                  key={project.title}
                >
                  <div className="project-card-light" aria-hidden="true" />
                  <div className="project-topline">
                    <span>{project.number}</span>
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/[0.025] px-3 py-1 text-[0.62rem] font-medium tracking-[0.15em] text-white/55"
                    >
                      <CircleDot />
                      {project.signal}
                    </Badge>
                  </div>

                  <div className="project-icon" aria-hidden="true">
                    <Icon />
                  </div>

                  <div className="project-copy">
                    <p className="project-eyebrow">{project.eyebrow}</p>
                    <h3>{project.title}</h3>
                    <p className="project-statement">{project.statement}</p>
                    <p className="project-description">{project.description}</p>
                  </div>

                  <div className="project-footer">
                    <div className="project-tags" aria-label={`${project.title} technologies`}>
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <a
                      className="project-link"
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <span>VIEW SYSTEM</span>
                      <ArrowUpRight />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="method-section" aria-labelledby="method-title">
          <div className="section-heading method-heading">
            <div>
              <span className="section-number">02 / HOW I BUILD</span>
              <h2 id="method-title">From signal to system.</h2>
            </div>
            <Sparkles className="section-symbol" aria-hidden="true" />
          </div>

          <div className="method-track">
            {[
              ["01", "Find the friction", "Start with the repeated task, broken handoff, or decision that consumes attention."],
              ["02", "Design the loop", "Shape the information, judgment, tools, approvals, and feedback into one clear flow."],
              ["03", "Build for continuity", "Make the system observable, recoverable, and able to retain useful context over time."],
              ["04", "Compound the leverage", "Turn every execution into reusable knowledge for the next one."],
            ].map(([number, title, description]) => (
              <article className="method-item" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities-section" aria-labelledby="capabilities-title">
          <div className="capabilities-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core">
              <Bot />
            </div>
          </div>

          <div className="capabilities-copy">
            <span className="section-number">03 / CAPABILITIES</span>
            <h2 id="capabilities-title">
              Strategy, systems,
              <br />
              and the space between.
            </h2>
            <p>
              I work at the intersection where product thinking meets
              orchestration—close enough to the idea to understand it, and
              close enough to execution to make it real.
            </p>
            <div className="capability-list">
              {capabilities.map((capability) => (
                <span key={capability}>{capability}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" aria-labelledby="contact-title">
          <div className="contact-label">
            <span className="live-dot" />
            OPEN TO THE RIGHT CONVERSATION
          </div>
          <h2 id="contact-title">
            Let&apos;s build something
            <span> with leverage.</span>
          </h2>
          <Button
            asChild
            className="contact-cta h-auto rounded-full bg-emerald-300 px-7 py-4 text-xs font-bold tracking-[0.14em] text-[#03120f] shadow-[0_0_50px_rgba(110,231,183,0.22)] hover:bg-emerald-200"
          >
            <a href="https://evenslouis.ca">
              EVENSLOUIS.CA
              <ArrowUpRight />
            </a>
          </Button>
        </section>

        <footer className="site-footer">
          <div className="brand-mark" aria-hidden="true">
            <span>E</span>
            <i />
            <span>L</span>
          </div>
          <p>© 2026 EVENS LOUIS</p>
          <div>
            <a href="#top">BACK TO TOP</a>
            <a
              href="https://github.com/snevemoney"
              target="_blank"
              rel="noreferrer"
            >
              GITHUB
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
