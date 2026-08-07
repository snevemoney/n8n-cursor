# GitHub hygiene for all 15 public repos

The Cursor GitHub App for this agent only has write access to `snevemoney/n8n-cursor`.
Apply descriptions/topics/README headers from a machine with your user credentials.

## One-shot descriptions + topics

```bash
cd /path/to/n8n-cursor
bash docs/patches/github-hygiene/apply-gh-meta.sh
```

## README headers

Copy the matching `headers/<repo>.md` block to the **top** of each repo README
(replace Lovable boilerplate first). Lightning legacy banners are included.

## Repos covered

See `packages/shared-config/src/repo-registry.ts` for the canonical lane table.
