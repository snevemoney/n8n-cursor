/**
 * Paste into cursor-ide-browser → browser_cdp → Runtime.evaluate
 * (returnByValue: true). Page must be logged-in playlist?list=WL.
 *
 * Edit OFFSET / LIMIT before each batch. After scrape, save JSON and run:
 *   python3 scripts/hive/scrape-youtube-watch-later.py --from-json PATH \
 *     --write-dir docs/hive/outer-heaven/CONTENT/watch-later
 */
(() => {
  const OFFSET = 0;
  const LIMIT = 15;
  const SCROLL_PASSES = 0; // increase if DOM has fewer rows than OFFSET+LIMIT

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function loadRows() {
    for (let i = 0; i < SCROLL_PASSES; i++) {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await sleep(800);
    }
    return [...document.querySelectorAll("ytd-playlist-video-renderer")];
  }

  return loadRows().then((rows) => {
    const signedOut = !!document.querySelector(
      'a[href*="ServiceLogin"], ytd-button-renderer a[href*="accounts.google"]'
    );
    const header = document.querySelector(
      "yt-page-header-view-model, ytd-playlist-header-renderer, #page-header"
    );
    const items = [];
    const seen = new Set();

    for (const row of rows) {
      const titleA = row.querySelector("#video-title");
      const link = titleA || row.querySelector('a[href*="watch?v="]');
      if (!link) continue;
      const href = link.href || link.getAttribute("href") || "";
      const m = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      const title = (
        (titleA &&
          (titleA.getAttribute("title") ||
            titleA.getAttribute("aria-label") ||
            titleA.textContent)) ||
        ""
      )
        .trim()
        .replace(/\s+/g, " ");
      const channelEl = row.querySelector(
        "ytd-channel-name a, #channel-name a, yt-formatted-string.ytd-channel-name a"
      );
      const durEl = row.querySelector(
        "ytd-thumbnail-overlay-time-status-renderer #text, span#text.ytd-thumbnail-overlay-time-status-renderer"
      );
      const meta = row.querySelector("#video-info, ytd-video-meta-block");
      items.push({
        index: items.length + 1,
        title,
        channel: (channelEl ? channelEl.textContent : "")
          .trim()
          .replace(/\s+/g, " "),
        url: "https://www.youtube.com/watch?v=" + m[1],
        videoId: m[1],
        duration: (durEl ? durEl.textContent : "").trim().replace(/\s+/g, " "),
        added: (meta ? meta.innerText : "").trim().replace(/\s+/g, " ").slice(0, 80),
      });
    });

    const slice = items.slice(OFFSET, OFFSET + LIMIT).map((it, i) => ({
      ...it,
      index: i + 1,
    }));

    return {
      playlistUrl: location.href,
      playlistId: "WL",
      scrapedAt: new Date().toISOString(),
      loggedIn: !signedOut && slice.length > 0,
      scrolledToEnd: false,
      pageTitle: document.title,
      source: "cursor-ide-browser-cdp",
      offset: OFFSET,
      limit: LIMIT,
      domRowCount: rows.length,
      notes: [
        "Native Glass browser scrape — do not invent rows if loggedIn=false.",
        `Batch slice offset=${OFFSET} limit=${LIMIT} from ${items.length} parsed rows.`,
      ],
      items: slice,
    };
  });
})();
