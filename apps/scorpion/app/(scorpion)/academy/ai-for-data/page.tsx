'use client';

import Link from 'next/link';

export default function AIForDataPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase text-neutral-400 tracking-wide">
          Scorpion Academy
        </p>
        <h1 className="text-2xl font-bold mt-1">
          AI for Excel & Data Workflows
        </h1>
        <p className="text-neutral-300 mt-2 text-sm">
          How to use AI to compare reports, clean Excel tables, and enrich data.
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">Why it Matters</h2>
        <p>
          AI can spot discrepancies, clean tables, and fill missing information.
          It can compare two reports to find differences and similarities, and
          present clear summaries for faster decision-making.
        </p>
        <p>
          According to McKinsey, employees who spend several hours a week in
          spreadsheets can save multiple hours using AI—time that can be
          reinvested in analysis and decisions instead of manual cleanup.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">Typical Use Cases</h2>
        <div className="space-y-2">
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">📊 Compare Reports</p>
            <p className="text-xs text-neutral-300">
              Compare two PDF reports (e.g., 2023 vs 2024 financials) to detect trends,
              differences, and similarities. AI extracts key indicators and summarizes changes.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🧹 Clean Tables</p>
            <p className="text-xs text-neutral-300">
              Remove duplicates, fix inconsistent values, fill missing fields (like area codes),
              and standardize data formats in Excel/CSV files.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">✨ Enrich Data</p>
            <p className="text-xs text-neutral-300">
              Add new columns (like area codes, segments, derived metrics) from existing fields
              or external data sources.
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold mb-1">🔮 Run Simulations</p>
            <p className="text-xs text-neutral-300">
              Test what happens when you change specific variables. Run scenario analysis
              or what-if simulations on cleaned/enriched datasets.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100">
        <h2 className="text-lg font-semibold">Good Practices</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Privacy First:</strong> Remove or anonymize personal and sensitive data
            (names, IDs, addresses, phone numbers) before processing.
          </li>
          <li>
            <strong>Be Specific:</strong> Specify exact columns and rules (e.g., how to detect
            duplicates, which values to fill, which columns to compare).
          </li>
          <li>
            <strong>Break It Down:</strong> Split workflows into steps: compare → clean → enrich → simulate.
            Don&apos;t try to do everything at once.
          </li>
          <li>
            <strong>Verify Results:</strong> Always review AI changes on a sample before applying
            them broadly. Spot-check key rows/sections to validate accuracy.
          </li>
          <li>
            <strong>State Questions Upfront:</strong> When attaching files, clearly state your
            questions and needed outputs to reduce unnecessary iterations.
          </li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="text-lg font-semibold">Example Workflows</h2>
        <div className="space-y-2">
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold text-xs mb-1">Compare Reports</p>
            <p className="text-xs text-neutral-300">
              &quot;Compare the 2023 and 2024 financial reports. Extract differences in revenue,
              expenses, and key metrics. Summarize trends and highlight significant changes.&quot;
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold text-xs mb-1">Clean Excel</p>
            <p className="text-xs text-neutral-300">
              &quot;Remove duplicates in my customer list based on email (column B). Fill missing
              area codes in column C based on the city name in column D.&quot;
            </p>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <p className="font-semibold text-xs mb-1">Enrich Data</p>
            <p className="text-xs text-neutral-300">
              &quot;Add a customer segment column to my Excel file. Segment based on purchase
              amount in column E: High (&gt;$1000), Medium ($100-$1000), Low (&lt;$100).&quot;
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed text-neutral-100 border-t border-neutral-700 pt-4">
        <h2 className="text-lg font-semibold">How Scorpion Helps</h2>
        <p>
          The DataOps Council automatically detects data workflows and provides guidance on
          privacy, verification, and workflow design. The Data Workflow Selector identifies
          the appropriate pipeline (compare, clean, enrich, simulate) for your task.
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 mt-2">
          <p className="text-xs text-emerald-300">
            <strong>💡 Tip:</strong> Check the Council tab when working with Excel/CSV/PDF files
            to see DataOps recommendations and the selected workflow.
          </p>
        </div>
      </section>

      <div className="border-t border-neutral-700 pt-4">
        <Link
          href="/academy/ai-foundations"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to AI Foundations
        </Link>
      </div>
    </div>
  );
}

