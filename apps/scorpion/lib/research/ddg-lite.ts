// Server-side only - cheerio uses undici which has private class fields
// This file should only be imported in server-side code (API routes, server components)
// Mark as server-only to prevent client-side bundling
import 'server-only';

// Use dynamic import to ensure it's only loaded at runtime, not during build
async function getCheerio() {
  // Dynamic import to avoid webpack parsing issues with undici
  const cheerioModule = await import("cheerio");
  return cheerioModule.default || cheerioModule;
}

export type SearchHit = { title: string; url: string; snippet?: string; source?: string };

const BASE = "https://html.duckduckgo.com/html/";

function unwrap(href: string | undefined, dataUddg?: string | undefined): string | null {
  if (!href) return null;
  
  if (href.startsWith("/l/?uddg=")) {
    try {
      return decodeURIComponent(href.slice("/l/?uddg=".length));
    } catch {
      // ignore
    }
  }
  
  if (/^https?:\/\//i.test(href)) return href;
  if (dataUddg && /^https?:\/\//i.test(dataUddg)) return dataUddg;
  
  return null;
}

function host(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function ddgLiteSearch(
  query: string,
  {
    maxSites = 10,
    locale = "us-en",
    allowNewsBias = /news|latest|today|update|breaking/i.test(query),
  }: {
    maxSites?: number;
    locale?: string;
    allowNewsBias?: boolean;
  } = {}
): Promise<SearchHit[]> {
  const qs = new URLSearchParams({
    q: query,
    kl: locale,
    kp: "-2", // safe-search off
  });

  const res = await fetch(`${BASE}?${qs}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    console.warn(`[DDG Lite] HTTP ${res.status}`);
    return [];
  }

  const html = await res.text();
  const cheerioLib = await getCheerio();
  const $ = cheerioLib.load(html);

  // News domain bias set
  const NEWS_SET = new Set([
    "coindesk.com",
    "cointelegraph.com",
    "reuters.com",
    "bloomberg.com",
    "wsj.com",
    "ft.com",
    "cnbc.com",
    "theblock.co",
    "decrypt.co",
    "forbes.com",
  ]);

  const hits: SearchHit[] = [];
  const blocks = $(".result");

  blocks.each((_, el) => {
    const a = $(el).find("a.result__a").first();
    const href = unwrap(
      a.attr("href") || "",
      a.attr("data-uddg") || a.attr("data-url") || undefined
    );
    const title = a.text().trim();
    const snippet =
      $(el).find(".result__snippet").text().trim() ||
      $(el).find(".result__a").parent().next().text().trim() ||
      undefined;

    if (!href || !title) return;

    const h = host(href);
    hits.push({ title, url: href, snippet, source: h });
  });

  // De-dupe: prefer one per domain by default; allow 2 if news bias
  const perDomainLimit = allowNewsBias ? 2 : 1;
  const seen: Record<string, number> = {};
  const out: SearchHit[] = [];

  for (const h of hits) {
    const dom = h.source || host(h.url);
    if (!seen[dom]) seen[dom] = 0;
    if (seen[dom] >= perDomainLimit) continue;

    // Lightly prefer news domains if bias is on
    if (allowNewsBias && NEWS_SET.has(dom)) {
      out.unshift(h); // move earlier
      seen[dom]++;
      continue;
    }

    out.push(h);
    seen[dom]++;
    if (out.length >= Math.max(6, Math.min(maxSites, 10))) break;
  }

  // If we still have < 6, try "lite page 2" (POST with hidden input 's')
  if (out.length < 6) {
    const nextKey = $("input[name='s']").attr("value");
    if (nextKey) {
      try {
        const res2 = await fetch(BASE, {
          method: "POST",
          headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Language": "en-US,en;q=0.9",
          },
          body: new URLSearchParams({
            q: query,
            s: nextKey,
            kl: locale,
            kp: "-2",
          }).toString(),
        });

        if (res2.ok) {
          const html2 = await res2.text();
          const cheerioLib2 = await getCheerio();
          const $2 = cheerioLib2.load(html2);

          $2(".result").each((_, el) => {
            const a = $2(el).find("a.result__a").first();
            const href = unwrap(
              a.attr("href") || "",
              a.attr("data-uddg") || a.attr("data-url") || undefined
            );
            const title = a.text().trim();
            const snippet = $2(el).find(".result__snippet").text().trim() || undefined;

            if (!href || !title) return;

            const dom = host(href);
            seen[dom] = seen[dom] ?? 0;
            if (seen[dom] >= perDomainLimit) return;

            out.push({ title, url: href, snippet, source: dom });
            seen[dom]++;
          });
        }
      } catch (e) {
        console.warn("[DDG Lite] Page 2 fetch failed:", e);
      }
    }
  }

  // Final cap & sanitize
  const uniq = new Map<string, SearchHit>();
  for (const h of out) {
    if (!uniq.has(h.url)) {
      uniq.set(h.url, h);
    }
  }

  const results = Array.from(uniq.values()).slice(0, Math.max(6, Math.min(maxSites, 10)));
  console.log(`✅ DDG Lite found ${results.length} unique results for: "${query}"`);
  
  return results;
}
