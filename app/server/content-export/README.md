# B2 Content Export

A clean, self-contained snapshot of the **Reading, Listening, Speaking and
Writing** content — every paper, section and item, **with the real expected
answers** (`answer` / `answerPayload` / `rationale`). Generated straight from
the live database by `tools/export_content.js`, with zero dependency on
anything outside this repo (unlike the original seed scripts, two of which
read from JSON files on the author's own machine — this export doesn't).

Regenerate any time with:

```bash
cd app/server
node tools/export_content.js
```

## Files

| File | Contents |
|---|---|
| `reading.json` | All Reading papers/sections/items (Goethe, telc, and Skillcase-original practice) |
| `listening.json` | All Listening papers/sections/items |
| `speaking.json` | All Speaking papers/sections/items |
| `writing.json` | All Writing papers/sections/items |
| `manifest.json` | Generation timestamp + paper/item counts per skill and board |

## Schema

Each `<skill>.json` is an array of **papers**:

```jsonc
{
  "paperId": "goethe-b2-lesen-1",       // stable id, matches the live app's paper id
  "board": "goethe",                    // "goethe" | "telc" | "custom" (Skillcase-original, not exam-board content)
  "title": "Goethe-Zertifikat B2 — Lesen, Übungsset 1",
  "examVersion": "B2",
  "alignment": "exam_format_practice",  // "licensed_official" | "exam_format_practice" | "exam_aligned" | "original"
  "sourceType": "ORIGINAL",             // "ORIGINAL" | "ADAPTED" | "INSPIRED" | "DIRECT_LICENSED"
  "reviewStatus": "AUTO_QA_PASS",       // "DRAFT" | "AUTO_QA_PASS" | "SME_REVIEWED" | "SME_CHANGES_REQUIRED" | "PRODUCTION"
  "minutes": 15,
  "sections": [
    {
      "partNo": 1,
      "module": "lesen",                // "lesen" | "hoeren" | "sprachbausteine" | "schreiben" | "sprechen"
      "title": "Forum: Vertrauensarbeitszeit — nur ein Vorteil?",
      "instruction": "Lesen Sie den Forumsbeitrag und beantworten Sie die Aufgaben.",
      "passage": "…the full reading passage / listening transcript, or null…",
      "skill": "reading",
      "scoringMode": "OBJECTIVE",
      "minutes": 15,
      "items": [
        {
          "itemNo": 1,
          "itemId": "goethe-b2-lesen-1_1",   // human-readable id: `${paperId}_${itemNo}`
          "itemType": "MCQ",                 // MCQ | MULTI_SELECT | TRUE_FALSE | MATCHING | GAP_FILL | ORDERING | SHORT_TEXT | LONG_TEXT | SPOKEN_RESPONSE
          "stem": "Wie hat sich die Einstellung des Autors …?",
          "options": ["Er lehnt sie inzwischen komplett ab.", "…", "…"],
          "answer": 1,                        // 0-based index into `options`, for MCQ
          "answerPayload": null,              // shape depends on itemType — see below
          "rationale": "Er war zunächst begeistert …",  // the real expected-answer explanation
          "payload": {},                      // extra per-type fields (e.g. min_words/rubric_id for LONG_TEXT)
          "scoringMode": "OBJECTIVE",          // "OBJECTIVE" | "RUBRIC" | "TRANSCRIPT_ONLY" | "UNSCORED"
          "points": 1,
          "capability": "structure",          // which of the 14 B2 capabilities this item measures
          "difficulty": "B",                  // "A" | "B" | "C"
          "sourceType": "ORIGINAL",
          "reviewStatus": "AUTO_QA_PASS"
        }
      ]
    }
  ]
}
```

### Answer key shape by `itemType`

Verified directly against this export's actual data (not assumed from convention) — every row below was checked against a real item of that type:

| itemType | Where the answer lives |
|---|---|
| `MCQ` | `answer` — 0-based index into `options` |
| `MULTI_SELECT` | `answerPayload.correct` — array of 0-based indices |
| `TRUE_FALSE` | `answerPayload.value` — `true` (Richtig) or `false` (Falsch) |
| `MATCHING` | `answerPayload.mapping` — `{ "leftIndex": rightIndex, ... }` (keys are strings, JSON object) |
| `ORDERING` | `answerPayload.order` — the correct index permutation, e.g. `[1,3,2,0]` |
| `SHORT_TEXT` / `LONG_TEXT` | No answer key — `scoringMode: "RUBRIC"`. `payload.rubric_id`/`rubric_key` name the rubric; `payload.expected` (when present) states the specific content a correct answer must cover; `rationale` states the general evaluation criteria. Never auto-graded to a number. |
| `SPOKEN_RESPONSE` | No answer key — `scoringMode: "TRANSCRIPT_ONLY"`. Not recorded or scored in the current product; `rationale` states the real evaluation criteria for a human reviewer. |

`GAP_FILL` exists as an item type in the product's schema (used by the core-2026b diagnostic, not by Reading/Listening/Speaking/Writing content) but does not appear in this export — it's listed in `itemType`'s full enum elsewhere in the codebase, just not present here.

## Honesty notes for whoever ingests this

- `board: "custom"` items are **Skillcase-original practice**, not Goethe or
  telc content — never present them as exam-board material.
- `reviewStatus` is not cosmetic. `DRAFT` means known-incomplete/incorrect and
  should not be surfaced as finished content; only `SME_REVIEWED` or
  `PRODUCTION` means a human has actually checked it. As of this export,
  `SME_REVIEWED`/`PRODUCTION` count is **zero** — everything here is machine-
  validated (`AUTO_QA_PASS`), not human-reviewed yet.
- A handful of `TRUE_FALSE` items (8 papers, see `manifest.json` if their
  count changes) are `reviewStatus: "DRAFT"` because their answer key could
  not be verified against a transcript — see `tools/fix_broken_rationale.js`
  in this same repo for the full story. Don't "fix" them by guessing; get a
  real transcript first.
