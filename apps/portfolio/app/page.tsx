import { AutomationShowcase } from "./components/AutomationShowcase";
import { FullStackSection } from "./components/FullStackSection";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#0a0d10] text-[#e4e8ee]">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero — public brand only; no tool login links */}
        <section className="mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="text-[#13c6a8]">EVENS LOUIS</span>
              </h1>
              <p className="text-xl md:text-2xl text-[rgba(228,232,238,0.65)] mb-6">
                AI Automation Engineer • Workflow Architect • Systems Builder
              </p>
              <p className="text-lg text-[rgba(228,232,238,0.8)] max-w-3xl leading-relaxed">
                I design and build intelligent automation systems, multi-agent workflows, and private AI infrastructure.
                My work combines cloud orchestration, workflow automation, system design, and LLM engineering into a single stack.
              </p>
              <p className="text-base text-[rgba(228,232,238,0.7)] max-w-3xl mt-4 leading-relaxed">
                Below is selected work — systems I run daily, not slide-deck demos.
              </p>
              <p className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:evens.louis.dev@gmail.com"
                  className="inline-block bg-[#13c6a8] text-[#0a0d10] font-semibold px-6 py-3 rounded-md hover:opacity-90 transition"
                >
                  Contact me
                </a>
                <a
                  href="/work"
                  className="inline-block border border-[rgba(19,198,168,0.45)] text-[#13c6a8] font-semibold px-6 py-3 rounded-md hover:bg-[rgba(19,198,168,0.08)] transition"
                >
                  All projects
                </a>
              </p>
            </div>
            <div className="w-24 h-24 rounded-full bg-[#0f1318] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-2xl font-semibold text-[#13c6a8] flex-shrink-0">
              EL
            </div>
          </div>
        </section>

        {/* Scorpion Section */}
        <section className="mb-20 md:mb-32">
          <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 md:p-8 bg-[#0f1318]">
            <div className="flex items-start gap-3 mb-6">
              <span className="text-3xl">🦂</span>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-semibold mb-2">SCORPION — Personal AI OS + Remote Automation Cloud</h2>
                <p className="text-lg text-[rgba(228,232,238,0.8)] mb-4">
                  Scorpion is a local-first AI operating system I built from scratch. It runs on my machine but controls a remote KVM2 infrastructure that executes:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {[
                'n8n workflow pipelines',
                'LLM reasoning tasks',
                'Data enrichment jobs',
                'Web scraping',
                'Content generation',
                'Webhooks + integrations',
                'Multi-agent research',
                'RAG knowledge chat',
                'Automation for external APIs'
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#13c6a8] mt-1">•</span>
                  <span className="text-sm text-[rgba(228,232,238,0.7)]">{item}</span>
                </div>
              ))}
            </div>

            {/* Architecture */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔧</span> Architecture
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(19,198,168,0.05)] border border-[rgba(19,198,168,0.2)]">
                  <h4 className="text-[#13c6a8] font-semibold mb-2">Local Layer (Private AI OS):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-[rgba(228,232,238,0.7)]">
                    <li>Agent Planner & Memory</li>
                    <li>MCP Tools (filesystem, research, knowledge, APIs)</li>
                    <li>Local LLM routing</li>
                    <li>Personal RAG vector database</li>
                    <li>System monitoring dashboard</li>
                    <li>Knowledge extraction</li>
                    <li>UI web app (private)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[rgba(19,198,168,0.05)] border border-[rgba(19,198,168,0.2)]">
                  <h4 className="text-[#13c6a8] font-semibold mb-2">Remote Layer (Automation Cloud):</h4>
                  <p className="text-xs text-[rgba(228,232,238,0.6)] mb-2 italic">Hosted on KVM2:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-[rgba(228,232,238,0.7)]">
                    <li>n8n automation cluster</li>
                    <li>LLM inference endpoints</li>
                    <li>Worker queues</li>
                    <li>Webhook receivers</li>
                    <li>Data pipelines</li>
                    <li>Deployment tools</li>
                    <li>API gateways</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[rgba(19,198,168,0.05)] border border-[rgba(19,198,168,0.2)]">
                  <h4 className="text-[#13c6a8] font-semibold mb-2">External Layer (Cloud APIs):</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-[rgba(228,232,238,0.7)]">
                    <li>OpenAI</li>
                    <li>ElevenLabs</li>
                    <li>Stability AI</li>
                    <li>Browser automation</li>
                    <li>OCR / scraping services</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🧠</span> Capabilities
              </h3>
              <p className="text-sm text-[rgba(228,232,238,0.7)] mb-3">Scorpion currently executes:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Text → Image generation',
                  'Image → UGC video ads',
                  'Social media profile finder',
                  'Data extraction + enrichment',
                  'Background removal (AI-based)',
                  'OCR pipelines',
                  'Web scraping with sentiment & summaries',
                  'Email automation',
                  'Inbound assistants',
                  'Excel/Sheets automation',
                  'Notifications (Telegram, Slack, Webhooks)',
                  'RAG chatbots & document assistants',
                  'Multi-agent research flows',
                  'AI error diagnosis',
                  'Data management jobs',
                  'Fully automated pipelines with retries + alerts'
                ].map((capability) => (
                  <div key={capability} className="flex items-start gap-2">
                    <span className="text-[#13c6a8] mt-1">→</span>
                    <span className="text-sm text-[rgba(228,232,238,0.7)]">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why It Matters */}
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🔥</span> Why It Matters
              </h3>
              <p className="text-sm text-[rgba(228,232,238,0.8)] mb-3">
                Scorpion proves that I can:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {[
                  'Architect automation systems',
                  'Integrate cloud services',
                  'Manage workflows',
                  'Build distributed systems',
                  'Handle LLM tools',
                  'Design multi-agent pipelines',
                  'Work like a full-stack automation engineer'
                ].map((skill) => (
                  <div key={skill} className="flex items-start gap-2">
                    <span className="text-[#13c6a8] mt-1">•</span>
                    <span className="text-sm text-[rgba(228,232,238,0.7)]">{skill}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[rgba(228,232,238,0.6)] italic">
                Most juniors have a to-do app. I have an AI operating system that controls a cloud.
              </p>
            </div>
          </div>
        </section>

        {/* End-to-End Systems Section */}
        <FullStackSection />

        {/* Featured Automation Work Section */}
        <AutomationShowcase />

        {/* Skills Section */}
        <section className="mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">🛠 Skills</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[rgba(228,232,238,0.9)]">AI Engineering</h3>
              <div className="flex flex-wrap gap-2">
                {['Multi-agent orchestration', 'Workflow automation', 'AI pipelines (inference, generation, processing)', 'RAG (Retrieval-Augmented Generation)', 'Embeddings & context engineering', 'LLM tool design (MCP)', 'System prompting'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(228,232,238,0.7)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[rgba(228,232,238,0.9)]">Automation & Cloud</h3>
              <div className="flex flex-wrap gap-2">
                {['n8n advanced workflows', 'API integrations', 'Webhooks & triggers', 'Cloud architecture basics', 'Event-driven systems', 'KVM2 server deployments', 'Caddy reverse proxy', 'PM2 process manager'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(228,232,238,0.7)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[rgba(228,232,238,0.9)]">Development</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js (portfolio + UI)', 'TypeScript basics', 'JSON/REST APIs', 'Server configuration', 'CLI scripting', 'Git/GitHub workflows'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(228,232,238,0.7)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-[rgba(228,232,238,0.9)]">Data & Processing</h3>
              <div className="flex flex-wrap gap-2">
                {['Web scraping', 'OCR', 'Background removal', 'Data structuring', 'Sheets/Excel automation', 'Transformation pipelines'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm text-[rgba(228,232,238,0.7)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">🧪 Tools I Use</h2>
          <div className="flex flex-wrap gap-3">
            {['n8n', 'OpenAI', 'ElevenLabs', 'Stability AI', 'Supabase (optional storage)', 'MCP Tools', 'KVM2 VPS', 'PM2', 'Caddy', 'Next.js', 'Git', 'Node.js', 'Curl/Bash', 'DuckDuckGo Scrapers'].map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-base text-[rgba(228,232,238,0.8)] hover:border-[#13c6a8] transition-colors"
              >
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">👔 Experience</h2>
          
          <div className="space-y-8">
            <div className="border-b border-[rgba(255,255,255,0.08)] pb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">IA Auto Finance — Current Role</h3>
                </div>
                <div className="text-[rgba(228,232,238,0.65)] text-sm md:text-base">
                  Present
                </div>
              </div>
              <p className="text-[rgba(228,232,238,0.8)]">
                Customer service + process management. Handles documents, verification, and workflow coordination.
              </p>
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">AI Automation Engineer (Self-Built Experience)</h3>
                </div>
                <div className="text-[rgba(228,232,238,0.65)] text-sm md:text-base">
                  2022 – Present
                </div>
              </div>
              <p className="text-[rgba(228,232,238,0.8)] mb-4">
                Designing my own automation and AI systems:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-[rgba(228,232,238,0.8)]">
                <li>Built Scorpion (local OS + remote cloud)</li>
                <li>Built 30+ advanced n8n workflows</li>
                <li>Automated real business use cases</li>
                <li>Created full pipelines for media, data, and AI processes</li>
              </ul>
              <p className="text-sm text-[rgba(228,232,238,0.6)] mt-3 italic">
                Equivalent to real-world engineering experience.
              </p>
            </div>
          </div>
        </section>

        {/* Why You Want Me Section */}
        <section className="mb-20 md:mb-32">
          <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 md:p-8 bg-[#0f1318]">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center gap-2">
              <span>🎯</span> Why You Want Me On Your Team
            </h2>
            <p className="text-lg text-[rgba(228,232,238,0.8)] mb-4">I bring:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                'Real system-building experience',
                'Automation engineering skills',
                'Cloud & workflow architecture understanding',
                'Ability to build internal tools',
                'Fast learning speed',
                'Problem-solving mindset',
                'A unique personal AI OS that proves engineering ability'
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#13c6a8] mt-1">•</span>
                  <span className="text-sm text-[rgba(228,232,238,0.7)]">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-[rgba(228,232,238,0.6)] italic">
              Most people talk about AI. I built my own platform around it.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">📞 Contact</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <a
                href="mailto:evens.louis.dev@gmail.com"
                className="text-lg text-[#13c6a8] hover:underline"
              >
                evens.louis.dev@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <a
                href="https://evenslouis.ca/"
                className="text-lg text-[#13c6a8] hover:underline"
              >
                evenslouis.ca
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
