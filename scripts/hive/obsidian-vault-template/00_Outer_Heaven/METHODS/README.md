# Methods — how Evens does X

Reusable workflows promoted from chronicle, INBOX, or manual capture.

```dataview
TABLE domain, status, last_verified, survival_score
FROM "00_Outer_Heaven/METHODS"
WHERE file.name != "README"
SORT last_verified DESC
```

## Promote a method

```bash
bash scripts/hive/outer-heaven/promote-to-method.sh \
  --domain business --title "Life business ops smoke" \
  --from-chronicle oh-20260811-abc --slug life-business-smoke
```

## Domains

coding · business · marketing · vps · video · clipping · payments · research · social · engineering
