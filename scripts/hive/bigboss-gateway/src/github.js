import { REPOS, TIME_RANGES, USER_AGENT } from './constants.js';

const TIME_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export function timeRangeCutoff(timeRange, now = Date.now()) {
  const range = TIME_RANGES.has(timeRange) ? timeRange : '7d';
  if (range === 'any') return null;
  return now - TIME_MS[range];
}

export function withinTimeRange(iso, cutoff) {
  if (cutoff == null) return true;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return true;
  return ms >= cutoff;
}

export function normalizePull(pr, repo) {
  const owner = repo?.owner || String(pr.base?.repo?.full_name || '').split('/')[0] || 'snevemoney';
  const name = repo?.name || String(pr.base?.repo?.name || pr.base?.repo?.full_name || '').split('/')[1] || 'unknown';
  return {
    type: 'pr',
    repo: `${owner}/${name}`,
    number: pr.number,
    title: String(pr.title || ''),
    state: pr.state || 'open',
    draft: Boolean(pr.draft),
    merged_at: pr.merged_at || null,
    html_url: pr.html_url || `https://github.com/${owner}/${name}/pull/${pr.number}`,
    updated_at: pr.updated_at || pr.created_at || null,
    created_at: pr.created_at || null,
    user: pr.user?.login || pr.user || null,
  };
}

export function normalizeCommit(commit, repo) {
  const owner = repo?.owner || 'snevemoney';
  const name = repo?.name || 'unknown';
  const message = String(commit.commit?.message || commit.message || '').split('\n')[0];
  const when = commit.commit?.committer?.date || commit.commit?.author?.date || commit.commit?.committer?.date || null;
  const sha = String(commit.sha || '').slice(0, 7);
  return {
    type: 'commit',
    repo: `${owner}/${name}`,
    sha,
    title: message,
    html_url: commit.html_url || `https://github.com/${owner}/${name}/commit/${commit.sha}`,
    updated_at: when,
    created_at: when,
  };
}

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': USER_AGENT,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Live GitHub public API. Never invents PRs.
 * token from GITHUB_TOKEN if present; otherwise unauthenticated public API.
 */
export async function fetchGithubLive({
  token = process.env.GITHUB_TOKEN,
  timeRange = '7d',
  now = Date.now(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const headers = githubHeaders(token ? String(token).trim() : '');
  const cutoff = timeRangeCutoff(timeRange, now);
  const pulls = [];
  const commits = [];

  try {
    for (const repo of REPOS) {
      const prUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/pulls?state=open&per_page=20&sort=updated&direction=desc`;
      const prRes = await fetchImpl(prUrl, { headers });
      if (!prRes.ok) {
        throw new Error(`pulls_${repo.name}_${prRes.status}`);
      }
      const prJson = await prRes.json();
      if (!Array.isArray(prJson)) {
        throw new Error(`pulls_${repo.name}_not_array`);
      }
      for (const pr of prJson) {
        const item = normalizePull(pr, repo);
        if (withinTimeRange(item.updated_at, cutoff)) pulls.push(item);
      }

      const commitUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?per_page=8`;
      const commitRes = await fetchImpl(commitUrl, { headers });
      if (commitRes.ok) {
        const commitJson = await commitRes.json();
        if (Array.isArray(commitJson)) {
          for (const commit of commitJson) {
            const item = normalizeCommit(commit, repo);
            if (withinTimeRange(item.updated_at, cutoff)) commits.push(item);
          }
        }
      }
    }
    return { ok: true, pulls, commits };
  } catch {
    return { ok: false, pulls: [], commits: [] };
  }
}
