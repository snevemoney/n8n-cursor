import Link from 'next/link';
import {
  laneOrder,
  laneTitles,
  workCatalog,
  type WorkLane,
  type WorkProject,
} from '../../lib/work-catalog';

function badgeClass(lane: WorkLane): string {
  switch (lane) {
    case 'hive_core':
      return 'text-[#13c6a8] border-[rgba(19,198,168,0.35)]';
    case 'product_candidate':
      return 'text-[#e4e8ee] border-[rgba(228,232,238,0.25)]';
    case 'side_wip':
      return 'text-[rgba(228,232,238,0.7)] border-[rgba(255,255,255,0.12)]';
    case 'hive_capability':
      return 'text-[#7ec8e3] border-[rgba(126,200,227,0.3)]';
    case 'parked':
      return 'text-[rgba(228,232,238,0.5)] border-[rgba(255,255,255,0.1)]';
    case 'legacy':
      return 'text-[rgba(228,232,238,0.4)] border-[rgba(255,255,255,0.08)]';
    default: {
      const _exhaustive: never = lane;
      return _exhaustive;
    }
  }
}

function ProjectRow({ project }: { project: WorkProject }) {
  return (
    <li className="py-5 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-2">
        <h3 className="text-xl font-semibold text-[#e4e8ee]">{project.name}</h3>
        <span
          className={`text-xs uppercase tracking-wide px-2 py-0.5 border rounded-sm ${badgeClass(project.lane)}`}
        >
          {project.statusLabel}
        </span>
        {project.wip ? (
          <span className="text-xs text-[rgba(228,232,238,0.45)]">WIP — not a live product</span>
        ) : null}
      </div>
      <p className="text-[rgba(228,232,238,0.75)] mb-2 max-w-2xl leading-relaxed">{project.role}</p>
      <p className="text-sm text-[rgba(228,232,238,0.45)] mb-3">
        This is not {project.notTheProductOf}.
      </p>
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#13c6a8] text-sm hover:underline"
      >
        View on GitHub →
      </a>
    </li>
  );
}

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-[#0a0d10] text-[#e4e8ee]">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-14">
          <p className="text-sm text-[rgba(228,232,238,0.5)] mb-4">
            <Link href="/" className="text-[#13c6a8] hover:underline">
              Evens Louis
            </Link>
            <span className="mx-2">/</span>
            <span>Work</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#13c6a8]">Work</span>
          </h1>
          <p className="text-lg text-[rgba(228,232,238,0.7)] max-w-2xl leading-relaxed">
            Selected systems and experiments — labeled so hive tools, product candidates, and side
            projects are never confused. Links go to GitHub only; operator consoles are not public.
          </p>
        </header>

        {laneOrder.map((lane) => {
          const items = workCatalog.filter((p) => p.lane === lane);
          if (items.length === 0) return null;
          return (
            <section key={lane} className="mb-16">
              <h2 className="text-sm uppercase tracking-[0.15em] text-[rgba(228,232,238,0.45)] mb-4">
                {laneTitles[lane]}
              </h2>
              <ul>
                {items.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </ul>
            </section>
          );
        })}

        <footer className="pt-8 border-t border-[rgba(255,255,255,0.06)] text-sm text-[rgba(228,232,238,0.45)]">
          <Link href="/" className="text-[#13c6a8] hover:underline">
            ← Back home
          </Link>
          <span className="mx-3">·</span>
          <a href="mailto:evens.louis.dev@gmail.com" className="hover:text-[#e4e8ee]">
            Contact
          </a>
        </footer>
      </div>
    </div>
  );
}
