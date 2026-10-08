# learning-engine v0

Isolated research-packet slice. It does not import or touch `apps/agent-stack`, Jarvis, port 4018, or PRs #492 / #493 / #518. CI isolation allows only `learning-engine/**` plus the two explicit workflow files `.github/workflows/learning-engine.yml` and `.github/workflows/ai-code-validation.yml` (no `.github/**` glob).

Three on-disk piles (bookmark review, corpus re-ingest, YouTube l2 packs) become one packet shape. A Stage C harness then scores a provider-neutral `judgment.evaluate(packet) -> judgment` against cheap baselines. Jev and OpenAI Decisions are wired as providers and **refuse** unless you pass `--opt-in-live` **and** set the matching API key. Default paths never open a socket.

The repo is public. This folder ships code plus synthetic fixtures only.

## School (why this shape)

The packet is the store. Untrusted post/video words live in `source_text`. Directives live in `operator_instructions`. Evidence is a named kind plus a source ref that existed on disk or on the input row. Missing input is omitted or `unknown`, never guessed. Filter the row, then maybe call a model.

## Schema

Contract: [`schema/research_packet.v0.json`](schema/research_packet.v0.json)

Required fields: `schema_version`, `signal_id`, `source_type`, `source_text`, `content_access`, `analysis_scope`, `claims[]`, `evidence[]`, `scores`, `verification_state`, `processing_status`, `lifecycle_state`.

`content_access` / `analysis_scope`: `transcript` | `frames` | `full_visual` | `preview_only` | `none`.

Honesty rules the validator enforces:

- `full_visual` is rejected unless evidence includes at least one image-extension ref (`.jpg`/`.jpeg`/`.png`/`.webp`) **and** one video-extension ref (`.mp4`/`.webm`/`.mov`/`.mkv`/`.m4v`/`.avi`), both `exists=true`. Match by extension, not substring (`framework-notes.md` is not a frame). Claiming `full_visual` without `--root` is an error (the message says to pass `--root`). With `--root`, each image ref must be a non-empty file whose bytes are PNG, JPEG, GIF, or WebP (magic; extension need not match). Each video ref must be non-empty. `.mp4`/`.mov`/`.m4v` need an `ftyp` box at offset 4; `.webm`/`.mkv` need EBML (`1A 45 DF A3`); `.avi` needs `RIFF....AVI `; any other video extension is accepted if non-empty. Validate without `--root` reports `false_full_visual: "unchecked_no_root"` when those packets error (not `0`).
- Every evidence item has `kind` and `source_ref`. `exists=false` is rejected.
- Operator delimiter markers (`<<<INSTRUCTIONS>>>`) or prompt keys inside `source_text` are rejected. Jailbreak phrasing (`Ignore all prior instructions` and variants) sets `injection_suspect=true` and a warning; it is not a reject.
- `transcript_quality=suspect_hallucination` is a warning, not a reject.

Bookmark `source=full-text` maps to `content_access=transcript` (the row said full-text). REVIEW.csv has no original post: `source_text` is empty, `source_text_status=unavailable`, and the gist is `derived.reviewer_summary` (reviewer-authored, not source). `preview-only` maps to `preview_only`. Adapters never invent a URL from an id.

Corpus `status=OK` maps to `processing_status=ok`, then becomes `partial` when `classification` contains `PARTIAL` (for example `INGEST_PARTIAL`). That is a cautious choice: META said OK and also said the ingest was incomplete. It is not a guess that the job failed.

Transcript discovery is case-insensitive. Cleaning is shared; speech vs gap is not. Cleaning removes headings, operator lines (`Source:`, `Fetched:`, `_source:`, including bold `**Source:**`), `Kind:` / `Language:` lines at the top of a transcript, VTT chrome and timestamps, gap-note lines, and diagnostic lines (`yt-dlp`, `Whisper`, `MemAvailable`, `timedtext`). JSON files contribute caption-text fields only (`text`, `caption`, `transcript`, `source_text`, including `captions[].text`). Ids, descriptions, source labels, and URLs stay out of `source_text`.

**Corpus (META is authoritative).** `has_transcript` true or `transcript_chars` > 0: every discovered transcript file is transcript evidence and its cleaned text is `source_text`. No word threshold. If that cleaned text is only Whisper leftovers (`Thanks for watching`, `you`, `music`, `🎵`), keep the transcript and set `transcript_quality: suspect_hallucination`. Do not demote it. META says no transcript: gap, same as N1. File prose cannot override META.

**YouTube (no META booleans).** Speech sources are judged by content through `caption_file_is_speech` (same quality path as caption formats). After format cleaning, ≥5 Unicode word tokens that are not all hallucination → speech. 1–4 real tokens → speech with `transcript_quality=short`. Hallucination-only (`you`/`you`) is not speech. JSON uses caption-text fields only. Bracket timings such as `[ 0.1- 4.5]` and `[00:01.2 - 00:04.5]` are stripped.

**N7-1 (supersedes R7 / Consultant 4c):** a `TRANSCRIPT.md` that contains any `CAPTION_GAP` token is a gap note. It contributes **no** `source_text`, ever. Evidence is `kind=file`, `note=gap_note`. If it also has ≥5-token leftover prose (not tables, bullets, headings, metadata, URLs, or check lines), set `transcript_quality=gap_note_with_content` so the leftover is flagged, not lost. It is still not speech.

**N7-2 / N8-2:** a file is OCR only when a basename token (split on `[-_.\\s]`) is exactly `ocr` (`ocr-frames.txt`, `frames_ocr.txt`). A video id that merely contains the letters o-c-r is speech, not OCR. OCR goes in `derived.ocr_text` (truncated) plus an evidence ref. It never goes in `source_text` and never counts as speech for `caption_gap`.

**N8-1 speech order** (supersedes the R8 caption-first order): (1) a non-gap `TRANSCRIPT.md`; (2) `whisper.txt`, `transcript.txt`, `transcript.json`; (3) caption formats (`*.vtt`, `captions*`, `captions_timeline`, `stills_captions.json`, `player-caption-samples.json`, `*burnin*` caption JSON). Inside a tier, prefer ≥5-token (`ok`) over 1–4-token (`short`). A short file is used only when no tier has ≥5-token speech. Windowed captions (`*win1*`, `*win5*`) in the same tier: most distinct tokens wins; filename breaks ties. Never longest-file-wins. Rolling YouTube VTTs are de-duplicated before pick and before disagreement (strip `<c>` / timestamp tags; drop a line that equals the previous emitted line; when a cue starts with the previous line, emit only the suffix). `source_text` is exactly the preferred file's cleaned caption lines.

`TRANSCRIPT.md` without `CAPTION_GAP`: empty / heading-only / metadata-only after stripping is not speech. Pack has speech when a tier file counts as speech **or** a non-gap `TRANSCRIPT.md` has speech lines. `caption_gap` only when the pack has no speech. `transcript_disagreement` when metadata and content disagree, or when preferred and another speech file differ materially. A candidate whose distinct tokens are a ≥95% subset of the preferred file is not a disagreement. Disagreement also requires a preferred file; without one the pack lists refs and does not flag. `disagreement_refs` are packet-relative paths: preferred first, then every differing file. Always non-empty when `transcript_disagreement` is set.

`--root` resolves each ref as `root / evidence_base / source_ref`. Adapters write `evidence_base` (relative to the convert input, or absolute). Packets that do not claim `full_visual` may validate without `--root` (disk check skipped, warning). Packets that claim `full_visual` require `--root`. `--rebuild` opens the DB (so a hot rollback journal is applied), copies it with the sqlite3 backup API into a unique temp, runs `PRAGMA integrity_check`, then `os.replace`s the realpath target; other types and all judgments stay. A symlink alias of the DB stays a symlink. Store, rebuild, and migration take an exclusive `flock` on `<db>.lock` next to the real file — do not delete that lock file while a run is active. Any rebuild failure leaves the original byte-identical; `store` prints a one-line JSON error and exits 1 (no traceback). An R6-schema DB (packets PK `signal_id`, judgments without `run_id`) is migrated in one transaction: packets get a composite key, each legacy judgment gets a distinct `legacy-migrated-<rowid>` (or the R6 run marker / timestamp if that column exists), and matching `runs` rows are created. The migrator refuses `INSERT OR REPLACE` on judgments and rolls back if the migrated judgment count does not match the legacy count. Any error leaves the file byte-identical; `store` and `eval --sqlite` print the same JSON error and exit non-zero. Test-only rebuild pause: `LEARNING_ENGINE_TEST_HOOKS=1` plus `LEARNING_ENGINE_PAUSE_REBUILD=after_copy` and `LEARNING_ENGINE_REBUILD_GATE`; inert unless the test-hooks var is set.

**N9-2 (known limitation):** migrated judgment `source_type` is inferred from the surviving packet row for that `signal_id`. R6 judgments had no `source_type`, and R6 packets were already keyed only by `signal_id`, so an overwritten packet cannot recover which source type the judgment belonged to. The migration does not invent a second packet.

A lexicon or `keyword_rules` run whose `source_text` is empty on every packet reports `status: not_applicable: source_text unavailable` instead of recall 0.0.

**Corpus META missing both signals.** If META has neither `has_transcript` nor `transcript_chars`, fall back to TRANSCRIPT.md speech lines (≥5 tokens) and set `transcript_quality=meta_missing`.

`source_text` is spoken words only. Markdown headings (`# Transcript`), leading `_source: …_` / `Source:` / `Fetched:` provenance, and WEBVTT headers (`WEBVTT`, `Kind:`, `Language:`), cue numbers, block `NOTE`/`STYLE`/`REGION` headers, timestamps, and inline `<c>` / `<v Speaker>` / `<00:00:01.234>` tags are stripped. A `captions_timeline.txt` line that carries a timestamp and words on the same row keeps the words. `NOTE`/`STYLE`/`REGION` are stripped only as VTT block headers, never because a spoken line starts with those letters. Evidence `source_ref` still points at the original file. Text is truncated at 50k characters, with `scores.source_text_chars` / `source_text_truncated`. Corpus `raw/` files that exist on disk are cited. YouTube `full_visual` requires frame evidence refs **and** a video file that exists in the pack (`source.mp4`, `source_vid.mp4`, section clips, or any other local video). Missing files are omitted, never invented.

YouTube `AE_STATUS.md` accepts the A–E table, `**key**: value` bullets, and letter bullets (`- A PASS — COVERAGE.md`, `- E PASS (file store) — …`).

Adapters collect invalid packets and keep going. Pass `--strict` to stop after the first invalid item. The JSON summary always includes `ok`, `packets`, `invalid`, and `invalid_items` with reasons. Under `--strict`, a run that hits an invalid item sets `ok` to false (and still exits 1).

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

Validate and count false `full_visual` (must be 0). Pass `--root` so image/video refs resolve as `root / evidence_base / ref`:

```bash
python3 -m learning_engine validate --input /tmp/le/bookmark.jsonl --min-packets 50
python3 -m learning_engine validate --input /tmp/le/youtube.jsonl --root "$YOUTUBE_L2_DIR" --min-packets 50
```

JSONL is the source of truth. SQLite is a derived index (primary key `(source_type, signal_id)`). `--rebuild` replaces only the source types in that JSONL:

```bash
python3 -m learning_engine store --packets /tmp/le/bookmark.jsonl --sqlite /tmp/le/index.sqlite
python3 -m learning_engine store --packets /tmp/le/bookmark.jsonl --sqlite /tmp/le/index.sqlite --rebuild
```

Judgments are unique per `(run_id, source_type, signal_id, provider)`. A new `run_id` adds rows; the same run is idempotent.

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

Report JSON includes `all` and `done_only` slices, the same slices `*_excluding_flagged` (drops packets with `caption_gap`, `transcript_disagreement`, `transcript_quality`, or `injection_suspect`), and `flagged_packets` counts by flag. A baseline or provider that reads `derived.reviewer_summary` is labelled **LEAKY** and is not presented as a classifier result.

Keyword replay is labelled `replay of stored kw_category (not a classifier)`. It does not read reviewer text. Operator-box reference on the real 1,201-row set: flagged 569, useful 180, TP 127, recall 0.7056, precision 0.2232.

Lexicon is a local gate over generic building words (no project/repo/desk names). It reports `dev` and `held_out` from a deterministic 70/30 split (seeded hash of id). On bookmark packets (`source_text` empty) lexicon and `keyword_rules` report `not_applicable: source_text unavailable`.

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
# --max-items defaults to 25 when --opt-in-live is set; pass a higher value to raise it.
# LEARNING_ENGINE_OPT_IN_LIVE / LEARNING_ENGINE_ALLOW_NETWORK are not a bypass.
# Missing flag or missing key → JSON refusal on stderr, exit 2. No live calls in tests/CI.
# --review + Jev: source_text stays empty; if a provider reads reviewer_summary the run is LEAKY.
python3 -m learning_engine eval \
  --provider jev --opt-in-live --max-input-tokens 2000 \
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
