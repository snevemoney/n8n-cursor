import { PullRequestList } from "./components/pull-request-list";
import { RefreshButton } from "./components/refresh-button";

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  } | null;
  state: string;
  draft: boolean;
}

async function fetchOpenPRs(): Promise<{
  prs: GitHubPR[];
  fetchedAt: string;
  error: string | null;
}> {
  const fetchedAt = new Date().toISOString();

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "mcp-connector-demo",
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      "https://api.github.com/repos/snevemoney/n8n-cursor/pulls?state=open&per_page=10",
      {
        headers,
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      const msg = `GitHub API returned ${res.status} ${res.statusText}`;
      return { prs: [], fetchedAt, error: msg };
    }

    const data: GitHubPR[] = await res.json();
    return { prs: data, fetchedAt, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return { prs: [], fetchedAt, error: message };
  }
}

export default async function HomePage() {
  const { prs, fetchedAt, error } = await fetchOpenPRs();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A0A0C",
        color: "#E8E8EC",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
        padding: "2rem",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: error ? "#FF5B5B" : "#4ADE80",
              boxShadow: error
                ? "0 0 8px #FF5B5B"
                : "0 0 8px #4ADE80",
              animation: "pulse 2s infinite",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#5B8CFF",
            }}
          >
            Live from GitHub
          </h1>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "#888",
          }}
        >
          snevemoney/n8n-cursor — Open Pull Requests (server-side, revalidate
          60s)
        </p>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          padding: "0.75rem 1rem",
          background: "#111115",
          borderRadius: "8px",
          border: "1px solid #1E1E24",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#888" }}>
          Last refresh:{" "}
          <time
            dateTime={fetchedAt}
            style={{ color: "#A8B4CC" }}
          >
            {new Date(fetchedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </time>
        </span>
        <RefreshButton />
      </div>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#1A0A0A",
            border: "1px solid #4A1A1A",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            color: "#FF8888",
            fontSize: "0.85rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && prs.length === 0 && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#666",
            fontSize: "0.9rem",
          }}
        >
          No open pull requests found.
        </div>
      )}

      {prs.length > 0 && <PullRequestList prs={prs} />}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}
