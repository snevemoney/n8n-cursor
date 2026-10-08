# learning-engine v0

Isolated research-packet slice. It does not import or touch `apps/agent-stack`, Jarvis, port 4018, or PRs #492 / #493 / #518.

Three on-disk piles (bookmark review, corpus re-ingest, YouTube l2 packs) become one packet shape. A Stage C harness then scores a provider-neutral `judgment.evaluate(packet) -> judgment` against cheap baselines. Jev and OpenAI Decisions are wired as providers and **refuse** unless you pass `--opt-in-live` **and** set the matching API key. Default paths never open a socket.

The repo is public. This folder ships code plus synthetic fixtures only.

## School (why this shape)

The packet is the store. Untrusted post/video words live in `source_text`. Directives live in `operator_instructions`. Evidence is a named kind plus a source ref that existed on disk or on the input row. Missing input is omitted or `unknown`, never guessed. Filter the row, then maybe call a model.

## Schema

Contract: [`schema/research_packet.v0.json`](schema/research_packet.v0.json)

Required fields: `schema_version`, `signal_id`, `source_type`, `source_text`, `content_access`, `analysis_scope`, `claims[]`, `evidence[]`, `scores`, `verification_state`, `processing_status`, `lifecycle_state`.

`content_access` / `analysis_scope`: `transcript` | `frames` | `full_visual` | `preview_only` | `none`.

Honesty rules the validator enforces:

- `full_visual` is rejected unless the packet carries frame/still evidence refs.
- Every evidence item has `kind` and `source_ref`. `exists=false` is rejected.
- Instruction markers or prompt keys inside `source_text` are rejected.

Bookmark `source=full-text` maps to `content_access=transcript` (the gist/post text was present; it is not a speech transcript). `preview-only` maps to `preview_only`. Adapters never invent a URL from an id.

Corpus `status=OK` maps to `processing_status=ok`, then becomes `partial` when `classification` contains `PARTIAL` (for example `INGEST_PARTIAL`). That is a cautious choice: META said OK and also said the ingest was incomplete. It is not a guess that the job failed.

Transcript discovery is case-insensitive. `TRANSCRIPT.md`, `*.vtt`, and caption files (`captions.json`, `captions_clean.txt`, `captions_timeline.txt`, `captions_w1.txt`, …) are cited as transcript evidence. Their text is copied into `source_text` (truncated at 50k characters, with `scores.source_text_chars` / `source_text_truncated`). Corpus `raw/` files that exist on disk are cited. YouTube `full_visual` requires frame evidence refs **and** a video file that exists in the pack (`source.mp4`, `source_vid.mp4`, section clips, or any other local video). Missing files are omitted, never invented.

Adapters collect invalid packets and keep going. Pass `--strict` to stop after the first invalid item. The JSON summary always includes `packets`, `invalid`, and `invalid_items` with reasons.

## Setup

Python 3.11+. Standard library only. From repo root:

```bash
export PYTHONPATH=learning-engine
python3 -m unittest discover -s learning-engine/tests -v
```

Or from this folder:

```bash
cd learning-engine
PYTHONPATH=. python3 -m unittest discover -s tests -v
```

## Adapters (local paths)

Each adapter takes an input path on *your* machine and writes packet JSONL. The real REVIEW.csv / corpus / l2 trees stay off git.

```bash
export PYTHONPATH=learning-engine

# Bookmark review: directory with REVIEW.csv + STATE.jsonl, or a CSV path
python3 -m learning_engine adapt bookmark --input /path/to/bookmark-review --output /tmp/le/bookmark.jsonl
python3 -m learning_engine.adapters.bookmark_review --input /path/to/bookmark-review --output /tmp/le/bookmark.jsonl

# Corpus re-ingest: folder that contains artifacts/<id>/META.json (or the artifacts/ dir)
python3 -m learning_engine adapt corpus --input /path/to/corpus-reingest --output /tmp/le/corpus.jsonl
python3 -m learning_engine.adapters.corpus_reingest --input /path/to/corpus-reingest --output /tmp/le/corpus.jsonl

# YouTube l2 or repass packs: parent of l2-<date>/ or repass-YYYYMMDD/<videoId>/, or one pack with AE_STATUS.md
python3 -m learning_engine adapt youtube-l2 --input /path/to/youtube-daily --output /tmp/le/youtube.jsonl
python3 -m learning_engine.adapters.youtube_l2 --input /path/to/youtube-daily --output /tmp/le/youtube.jsonl

# Default: write valid packets and report invalid counts. --strict stops at the first invalid packet.
python3 -m learning_engine adapt corpus --input /path/to/corpus-reingest --output /tmp/le/corpus.jsonl --strict
```

Validate and count false `full_visual` (must be 0):

```bash
python3 -m learning_engine validate --input /tmp/le/bookmark.jsonl --min-packets 50
```

Index JSONL into SQLite (stdlib `sqlite3`):

```bash
python3 -m learning_engine store --packets /tmp/le/bookmark.jsonl --sqlite /tmp/le/index.sqlite
```

## Stage C harness

```bash
# Keyword replay — the baseline that must hit the operator-box reference numbers
python3 -m learning_engine eval --provider keyword --mode replay \
  --review /path/to/REVIEW.csv --state /path/to/STATE.jsonl \
  --output /tmp/le/keyword-replay.json

# Optional rules-based keyword classifier (different baseline; will not hit 0.706 / 0.223)
python3 -m learning_engine eval --provider keyword --mode rules \
  --review /path/to/REVIEW.csv --state /path/to/STATE.jsonl \
  --output /tmp/le/keyword-rules.json

# Local lexicon / decision-gate
python3 -m learning_engine eval --provider lexicon \
  --review /path/to/REVIEW.csv --state /path/to/STATE.jsonl \
  --output /tmp/le/lexicon.json
```

Report JSON includes `all` and `done_only` slices with `n`, `flagged`, `useful`, `tp`, `recall`, `precision`, `high_recall`, `latency_ms_mean`, `cost_usd_mean`, plus per-item latency and cost (0 for local baselines).

Keyword replay definition (must match FORMATS-SYNTHETIC.md):

- Join every REVIEW.csv row to STATE.jsonl by `id` (FAILED included).
- `flagged` := `kw_category` != `unclassified` (missing STATE → not flagged).
- `useful` := usefulness ∈ {high, med}.
- recall = |flagged ∩ useful| / |useful|
- precision = |flagged ∩ useful| / |flagged|
- also high-only recall.

Reference on the real 1,201-row set (operator box, not in this repo): flagged 569/1201, useful 180, TP 127, recall 0.706, precision 0.223, high recall 16/16. DONE-only (1,191): flagged 566, recall 0.706, precision 0.224. Tolerance ±0.01.

## Live providers (off by default)

```bash
# Live call = explicit --opt-in-live AND the matching key. Nothing else authorizes.
# LEARNING_ENGINE_OPT_IN_LIVE / LEARNING_ENGINE_ALLOW_NETWORK are not a bypass.
# Missing flag or missing key → JSON refusal on stderr, exit 2. No live calls in tests/CI.
python3 -m learning_engine eval \
  --provider jev --opt-in-live --max-items 24 --max-input-tokens 2000 \
  --packets /tmp/le/labelled-packets.jsonl \
  --output /tmp/le/jev.json

python3 -m learning_engine eval \
  --provider openai --opt-in-live --max-items 24 --max-input-tokens 2000 \
  --packets /tmp/le/labelled-packets.jsonl \
  --output /tmp/le/openai.json
```

| Provider | Endpoint | Model | Key |
|---|---|---|---|
| `jev` | `POST https://openrouter.ai/api/alpha/decisions` | `typesafe/jev-1.13` | `OPENROUTER_API_KEY` |
| `openai` | `POST https://api.openai.com/v1/decisions` | `gpt-6-luna` | `OPENAI_API_KEY` |

Cost per item is `usage.cost` (or the response cost field) from the API, never an estimate. Keys are read from the environment only and are never printed.

Shadow only: do not wire this into Jarvis, `apps/agent-stack`, or PR #493.

## Acceptance commands (operator box)

Run these on the real trees. Synthetic fixtures in `fixtures/` are for tests only.

```bash
export PYTHONPATH=learning-engine

python3 -m learning_engine adapt bookmark --input "$BOOKMARK_REVIEW_DIR" --output /tmp/le/bookmark.jsonl
python3 -m learning_engine validate --input /tmp/le/bookmark.jsonl --min-packets 50
# expect packets >= 50, false_full_visual = 0

python3 -m learning_engine adapt corpus --input "$CORPUS_DIR" --output /tmp/le/corpus.jsonl
python3 -m learning_engine validate --input /tmp/le/corpus.jsonl --min-packets 50

python3 -m learning_engine adapt youtube-l2 --input "$YOUTUBE_L2_DIR" --output /tmp/le/youtube.jsonl
python3 -m learning_engine validate --input /tmp/le/youtube.jsonl --min-packets 50

python3 -m learning_engine eval --provider keyword --mode replay \
  --review "$BOOKMARK_REVIEW_DIR/REVIEW.csv" \
  --state "$BOOKMARK_REVIEW_DIR/STATE.jsonl" \
  --output /tmp/le/keyword-replay.json
# expect all.recall ≈ 0.706, all.precision ≈ 0.223 (±0.01)
# expect done_only.recall ≈ 0.706, done_only.precision ≈ 0.224 (±0.01)
```

## Out of scope

Video reprocessing, pgvector, skill writes, any non-shadow Jev use, and any change under `apps/agent-stack/**`.
