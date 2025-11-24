'use client';

export function FullStackSection() {
  return (
    <section className="mb-20 md:mb-32">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">End-to-End Systems I Build</h2>
        <p className="text-lg text-[rgba(228,232,238,0.8)] max-w-3xl">
          I don&apos;t just build isolated workflows — I connect frontends, backends, databases, and automations into full systems that handle real work, not just isolated proof-of-concepts.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 bg-[#0f1318]">
          <h3 className="text-lg font-semibold mb-2 text-[rgba(228,232,238,0.9)]">
            From form to database to notification
          </h3>
          <p className="text-sm text-[rgba(228,232,238,0.7)] leading-relaxed">
            A user fills a form or hits a webhook → n8n validates and enriches the data with AI → 
            data is stored in <strong className="text-[#13c6a8]">Supabase (Postgres)</strong> or Sheets/Excel → 
            Slack/Telegram gets notified.
          </p>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 bg-[#0f1318]">
          <h3 className="text-lg font-semibold mb-2 text-[rgba(228,232,238,0.9)]">
            From website actions to AI workflows
          </h3>
          <p className="text-sm text-[rgba(228,232,238,0.7)] leading-relaxed">
            A button or action on a <strong className="text-[#13c6a8]">Next.js</strong> frontend calls an API → 
            triggers an n8n webhook → runs an AI workflow (summarize, generate, classify) → 
            sends the result back to the UI or database.
          </p>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 bg-[#0f1318]">
          <h3 className="text-lg font-semibold mb-2 text-[rgba(228,232,238,0.9)]">
            From document to structured data
          </h3>
          <p className="text-sm text-[rgba(228,232,238,0.7)] leading-relaxed">
            A file is uploaded → n8n runs OCR, background removal or parsing → 
            data is normalized and stored in Supabase or Sheets → used later by chatbots or dashboards.
          </p>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-lg p-6 bg-[#0f1318]">
          <h3 className="text-lg font-semibold mb-2 text-[rgba(228,232,238,0.9)]">
            From custom data to chatbot
          </h3>
          <p className="text-sm text-[rgba(228,232,238,0.7)] leading-relaxed">
            Data is collected and stored (Supabase / sheets) → indexed for RAG → 
            a chatbot uses that data to answer questions in a front-end or internal tool.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6">Tech Stack Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[rgba(228,232,238,0.6)] mb-3 font-semibold">
              Automation &amp; AI
            </p>
            <div className="flex flex-wrap gap-2">
              {["n8n", "OpenAI", "MCP tools", "RAG workflows", "Webhooks", "Scheduled jobs"].map(
                (t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(228,232,238,0.7)]"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-[rgba(228,232,238,0.6)] mb-3 font-semibold">
              Backend &amp; Data
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Supabase (Postgres)",
                "REST APIs",
                "JSON",
                "Data pipelines",
                "Google Sheets / Excel",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(228,232,238,0.7)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-[rgba(228,232,238,0.6)] mb-3 font-semibold">
              Frontend
            </p>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React components", "Forms", "Dashboards", "API integration"].map(
                (t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(228,232,238,0.7)]"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-[rgba(228,232,238,0.6)] mb-3 font-semibold">
              Infra &amp; Dev
            </p>
            <div className="flex flex-wrap gap-2">
              {["Docker", "Caddy", "VPS (Hostinger KVM2)", "PM2", "Linux basics", "Cursor", "GitHub"].map(
                (t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(228,232,238,0.7)]"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}






