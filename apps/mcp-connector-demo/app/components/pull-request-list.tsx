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

export function PullRequestList({ prs }: { prs: GitHubPR[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {prs.map((pr) => (
        <li
          key={pr.number}
          style={{
            padding: "1rem 1.25rem",
            background: "#111115",
            border: "1px solid #1E1E24",
            borderRadius: "8px",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <a
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#5B8CFF",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  lineHeight: 1.3,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pr.title}
              </a>
              <div
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.75rem",
                  color: "#888",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#A8B4CC" }}>#{pr.number}</span>
                <span>by {pr.user?.login ?? "unknown"}</span>
                <span>
                  updated{" "}
                  {new Date(pr.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {pr.draft && (
                  <span
                    style={{
                      padding: "0.1rem 0.4rem",
                      background: "#2A2A30",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      color: "#AAA",
                    }}
                  >
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
