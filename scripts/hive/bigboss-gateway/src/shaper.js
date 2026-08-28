import {
  BRIEF_EVIDENCE_CAP,
  EVIDENCE_CAP,
  KINDS,
  LEFTOVER_DRAFT_PATTERNS,
  UNWIRED_MEMORY_SOURCES,
  URGENT_LINES_CAP,
} from './constants.js';
import { ORG_PACK } from './org-pack.js';
import { redactSecrets } from './sanitize.js';

export function isLeftoverDraft(title) {
  const text = String(title || '');
  return LEFTOVER_DRAFT_PATTERNS.some((pattern) => pattern.test(text));
}

export function kindForPull(pr) {
  if (pr.merged_at) return 'completed';
  if (pr.state === 'closed' && !pr.merged_at) return 'attempted';
  const title = String(pr.title || '');
  if (/\b(rfc|discuss|proposal|decide)\b/i.test(title)) return 'discussed';
  // Open / not merged is attempted — even when the title says "fix".
  if (pr.state === 'open' || !pr.merged_at) return 'attempted';
  return 'was';
}

export function kindForCommit() {
  return 'completed';
}

function assertKind(kind) {
  return KINDS.has(kind) ? kind : 'was';
}

function leftoverPenalty(title) {
  return isLeftoverDraft(title) ? 40 : 0;
}

export function scoreItem(item, now = Date.now()) {
  let score = 0;
  if (item.type === 'pr') {
    score += 50;
    if (!item.draft) score += 20;
    if (!isLeftoverDraft(item.title)) score += 30;
    if (/\b(fix|harden|route|align|add)\b/i.test(item.title) && !isLeftoverDraft(item.title)) {
      score += 8;
    }
  } else {
    score += 12;
  }
  const when = Date.parse(item.updated_at || item.created_at || '');
  if (!Number.isNaN(when)) {
    const ageDays = (now - when) / (24 * 60 * 60 * 1000);
    score += Math.max(0, 18 - ageDays);
  }
  score -= leftoverPenalty(item.title);
  return score;
}

function conflictForPull(pr) {
  const title = String(pr.title || '');
  const looksFinished = /\b(fix|fixed|complete|completed|done|ship|shipped)\b/i.test(title);
  if (looksFinished && pr.state === 'open' && !pr.merged_at) {
    return `PR ${pr.repo}#${pr.number} title says "fix" (or done/ship) but it is still open / not merged — kind is attempted, not completed.`;
  }
  return null;
}

function evidenceFromPull(pr) {
  const kind = assertKind(kindForPull(pr));
  const leftover = isLeftoverDraft(pr.title);
  const fact = leftover
    ? `Leftover cron draft (deprioritized): ${pr.title} — still open.`
    : `${pr.draft ? 'Draft' : 'Open'} PR ${pr.repo}#${pr.number}: ${pr.title}.`;
  return {
    fact,
    source_system: 'github',
    ref: pr.html_url,
    when: pr.updated_at || pr.created_at || null,
    kind,
  };
}

function evidenceFromCommit(commit) {
  return {
    fact: `Landed commit ${commit.repo}@${commit.sha}: ${commit.title}.`,
    source_system: 'github',
    ref: commit.html_url,
    when: commit.updated_at || null,
    kind: assertKind(kindForCommit()),
  };
}

function collectEntities(items, callerClass) {
  const entities = new Set();
  if (callerClass === 'CEO') entities.add('Evens Louis');
  for (const item of items) {
    if (item.repo) entities.add(item.repo.split('/')[1] || item.repo);
    if (item.number) entities.add(`${item.repo}#${item.number}`);
    if (/\bwatchdog\b/i.test(item.title || '')) entities.add('Watchdog');
    if (/\bhive\b/i.test(item.title || '')) entities.add('Hive');
    if (/\bfactory os\b/i.test(item.title || '')) entities.add('Factory OS');
  }
  return [...entities].slice(0, 16);
}

function spokenLine(pr) {
  const kind = kindForPull(pr);
  return `${pr.repo}#${pr.number} "${pr.title}" is ${kind} — still open, not merged.`;
}

function summarize({ query, pulls, commits, githubOk, unavailable, callerClass, leftoverCount }) {
  if (!githubOk) {
    return 'GitHub is unavailable. I will not invent pull requests.';
  }
  const material = pulls.filter((pr) => !isLeftoverDraft(pr.title));
  const parts = [];
  if (callerClass === 'CEO') {
    parts.push(ORG_PACK.building_mode_line);
  }
  if (material.length) {
    const heads = material.slice(0, 3).map((pr) => `${pr.repo}#${pr.number} ${pr.title}`);
    parts.push(`Live GitHub signals: ${heads.join('; ')}.`);
  } else if (pulls.length) {
    parts.push('No material open PRs in range; leftover cron drafts exist and were deprioritized.');
  } else if (commits.length) {
    parts.push(`No open PRs in range. Recent landed commits: ${commits[0].title}.`);
  } else {
    parts.push('GitHub returned no open PRs or recent commits in range.');
  }
  if (leftoverCount > 0) {
    parts.push(
      `Deprioritized ${leftoverCount} leftover cron draft(s) (HITL inbox, goal/gap board, Watchdog NO-WAITING, Factory OS reminder).`,
    );
  }
  if (unavailable.length) {
    parts.push(`Not wired: ${unavailable.join(', ')}.`);
  }
  if (query) parts.push(`Query: ${query}.`);
  return parts.join(' ');
}

/**
 * Shape live (or fixture) GitHub rows into the compact voice response.
 * Never invents PRs. Caps evidence. Reconciles "fix" titles that are still open.
 */
export function shapeOrganizationalSearch({
  query,
  scope = 'all',
  depth = 'standard',
  callerClass = 'PUBLIC',
  github = { ok: false, pulls: [], commits: [] },
  now = Date.now(),
} = {}) {
  const unavailable = [];
  if (scope === 'memory' || scope === 'all') {
    unavailable.push(...UNWIRED_MEMORY_SOURCES);
  }

  const wantGithub = scope === 'github' || scope === 'all';
  let pulls = [];
  let commits = [];
  let githubOk = false;

  if (wantGithub) {
    if (github?.ok) {
      githubOk = true;
      pulls = [...(github.pulls || [])];
      commits = [...(github.commits || [])];
    } else {
      unavailable.push('github');
    }
  }

  const rankedPulls = pulls.sort((a, b) => scoreItem(b, now) - scoreItem(a, now));
  const rankedCommits = commits.sort((a, b) => scoreItem(b, now) - scoreItem(a, now));
  const leftoverCount = rankedPulls.filter((pr) => isLeftoverDraft(pr.title)).length;

  const cap = depth === 'brief' ? BRIEF_EVIDENCE_CAP : EVIDENCE_CAP;
  const evidence = [];
  const possible_conflicts = [];

  for (const pr of rankedPulls) {
    if (evidence.length >= cap) break;
    evidence.push(evidenceFromPull(pr));
    const conflict = conflictForPull(pr);
    if (conflict) possible_conflicts.push(conflict);
  }
  for (const commit of rankedCommits) {
    if (evidence.length >= cap) break;
    evidence.push(evidenceFromCommit(commit));
  }

  const source_systems = [];
  if (githubOk && (pulls.length || commits.length)) source_systems.push('github');

  const material = rankedPulls.filter((pr) => !isLeftoverDraft(pr.title));
  const suggested_followups = [];
  if (githubOk && material[0]) {
    suggested_followups.push(`Is ${material[0].repo}#${material[0].number} the live signal, or should we ignore leftover cron drafts?`);
  }
  if (unavailable.includes('memory')) {
    suggested_followups.push('Memory, Grok, and Obsidian stay unwired — do not ask me to recall vault notes.');
  }
  if (!githubOk && wantGithub) {
    suggested_followups.push('Retry GitHub when egress is back; I will not invent PRs.');
  }

  let confidence = 0.2;
  if (githubOk && material.length) confidence = 0.78;
  else if (githubOk && leftoverCount) confidence = 0.42;
  else if (githubOk) confidence = 0.35;
  else if (!wantGithub) confidence = 0.15;
  else confidence = 0.12;

  const payload = {
    answer_summary: summarize({
      query: String(query || '').trim(),
      pulls: rankedPulls,
      commits: rankedCommits,
      githubOk,
      unavailable,
      callerClass,
      leftoverCount,
    }),
    evidence: evidence.slice(0, cap),
    entities: collectEntities([...rankedPulls, ...rankedCommits], callerClass),
    source_systems,
    confidence,
    possible_conflicts,
    suggested_followups: suggested_followups.slice(0, 4),
    unavailable: [...new Set(unavailable)],
  };
  return redactSecrets(payload);
}

export function shapeCeoBriefing({
  github = { ok: false, pulls: [], commits: [] },
  now = Date.now(),
} = {}) {
  const pulls = github?.ok ? [...(github.pulls || [])] : [];
  const ranked = pulls.sort((a, b) => scoreItem(b, now) - scoreItem(a, now));
  const material = ranked.filter((pr) => !isLeftoverDraft(pr.title));
  const leftoverCount = ranked.length - material.length;

  const recent_projects = [...new Set(ranked.map((pr) => pr.repo.split('/')[1] || pr.repo))];
  if (github?.ok && github.commits) {
    for (const commit of github.commits) {
      const name = commit.repo.split('/')[1];
      if (name && !recent_projects.includes(name)) recent_projects.push(name);
    }
  }

  const urgent_items = material.slice(0, 5).map((pr) => `${pr.repo}#${pr.number} ${pr.title}`);
  const urgent_lines = material.slice(0, URGENT_LINES_CAP).map((pr) => spokenLine(pr));

  let current_focus = ORG_PACK.building_mode_line;
  if (material[0]) {
    current_focus = `${material[0].repo}#${material[0].number} ${material[0].title}`;
  } else if (leftoverCount > 0) {
    current_focus = 'No material open PRs — leftover cron drafts only (deprioritized).';
  } else if (!github?.ok) {
    current_focus = `${ORG_PACK.building_mode_line} GitHub unavailable — not inventing PRs.`;
  }

  const payload = {
    caller_role: ORG_PACK.ceo.role,
    caller_name: ORG_PACK.ceo.name,
    session_privacy: ORG_PACK.session_privacy_ceo,
    current_focus,
    recent_projects,
    urgent_items,
    urgent_lines,
    last_bigboss_session: ORG_PACK.last_bigboss_session,
    building_mode: ORG_PACK.building_mode,
  };
  return redactSecrets(payload);
}
