# B2 Practice Content Inventory

Generated after the Reading + Writing content-depth pass, updated after the
Listening content-depth pass, updated again after the Speaking Practice
pass. Reflects the live database (and, for Maya, the live `topics` table
and `routes/b2.js`'s directory-scanned scenario registry), not source-file
counts — every number below was re-queried after seeding
(`src/seed/seed_reading_bank.js`, `src/seed/seed_writing_bank.js`,
`src/seed/seed_listening_bank.js`, `src/seed/seed_b2_maya.js`) and after
running `tools/make_practice_audio.js`, not copied from a spec file.

`board='custom'` throughout (Skillcase's own Practice Mode content), always
distinct from `board IN ('goethe','telc','telc_pflege')` (Exam Practice).
`core-2026b*` papers (the assess→weakness→practice→reassess diagnostic) are
excluded from every count in this document — they exist for a different
purpose and `practice.js`'s `categories()` excludes them from discovery too.

## Paper/experience count vs. item/task count

These are two different numbers and are reported separately everywhere
below, specifically so a "30+" target cannot be read off the wrong column:

- **Paper/experience count** = one row per `b2_papers` id — one Reading
  passage-and-question-set, one Writing prompt, one Grammar/Vocabulary
  worksheet.
- **Item/task count** = one row per `b2_paper_items` id — the actual
  questions/tasks inside those papers. Reading papers carry 3–5 items each;
  Writing papers carry exactly 1 (a single LONG_TEXT task), matching the
  existing `practice-writing-1/2` convention this pass extended rather than
  replaced.

## Summary table

| Category | Papers/experiences | Items/tasks | Audio assets | Ready (AUTO_QA_PASS+) | Draft | Missing audio |
|---|---:|---:|---:|---:|---:|---:|
| Reading | 30 | 126 | — | 30 | 0 | — |
| Listening | 30 | 107 | 30 | 30 | 0 | 0 |
| Speaking (Maya conversations) | 30 | — (branching, not item-counted) | — | 30 | 0 | — |
| Speaking (Kurzantwort paper, unchanged) | 1 | 3 | — | 1 | 0 | — |
| Writing | 30 | 30 | — | 30 | 0 | — |
| Grammar | 9 | 100 | — | 9 | 0 | — |
| Vocabulary | 9 | 100 | — | 9 | 0 | — |
| Workplace | — (23 interview questions, not a paper) | 23 | — | 23 | 0 | — |

None of this content has been SME-reviewed — every row tops out at
`AUTO_QA_PASS`. "Ready" here means *servable in Practice Mode*, not
teacher-approved; see `review_status` note at the end.

## Reading — 30 experiences, 126 items

28 new experiences this pass (`practice-reading-3` .. `practice-reading-30`),
on top of the 2 already live (`practice-reading-1/2`). All `board='custom'`,
`alignment='original'`, `source_type='ORIGINAL'`.

**Format variety** (each format appears 2–3 times across the 30):
opinion article, forum discussion, workplace memo/Hausmitteilung,
email/thread, informational article, interview, announcement, advice
column, short report, multiple-viewpoints, public notice, professional
communication.

**Item-type variety:**

| item_type | count |
|---|---:|
| MCQ | 93 |
| TRUE_FALSE | 30 |
| MULTI_SELECT | 1 |
| MATCHING | 1 |
| ORDERING | 1 |

MATCHING and ORDERING were previously defined in `content_model.js` and
graded by `assessment_content.js` but never used by the practice bank — this
pass is the first to exercise them here (`practice-reading-26`,
`practice-reading-20`).

**Capability distribution** (only capabilities whose `experiences` array in
`src/b2/capabilities.js` includes `"reading"` were used):

| capability | count |
|---|---:|
| summarise | 52 |
| structure | 21 |
| exemplify | 13 |
| justify | 12 |
| concede | 7 |
| argue | 6 |
| speculate | 5 |
| compare | 4 |
| language_awareness | 4 |
| *(pre-existing practice-reading-1/2 items)* ask_followup / understand_speech | 1 each |

The `ask_followup`/`understand_speech` rows belong to the two pre-existing
papers from the prior pass and were left as-is (instruction: don't overwrite
working content unnecessarily) — every new item in this pass uses only the
9 capabilities whose `experiences` list genuinely names `"reading"`.

**Difficulty distribution:** A 38 · B 68 · C 20 — a real spread, not a
round-robin label; A is stated-fact lookup, B is paraphrase/inference, C is
subtle distractors, dense argument structure, or hedged/Konjunktiv language.

**Answer-key coverage:** 126/126 objective items carry a valid key
(93 MCQ + 30 TRUE_FALSE + 1 MULTI_SELECT + 1 MATCHING + 1 ORDERING).

**Duplicate/overlap audit:** no two `board='custom'` reading passages share
identical text (`practice_reading_writing.test.js`, "no two reading practice
papers share an identical passage"); `tools/b2_content_audit.js` reports
**0 FAIL, 0 WARN** including its own duplicate-stem/repeated-passage checks.
No topic or passage here reuses a title or situation from
`seed_exam_papers.js` (Goethe/telc board), `src/seed/b2/core2026b/*.js` (the
diagnostic), or the two pre-existing practice-reading papers — verified by
hand against both source files before authoring.

## Writing — 30 experiences, 30 tasks

28 new tasks this pass (`practice-writing-3` .. `practice-writing-30`), on
top of the 2 already live. Every task is a single `LONG_TEXT` item,
`scoring_mode='RUBRIC'`, reusing `rubric_id=8` (`board='custom'`,
`task_type='kurzantwort'`) — the same rubric `practice-writing-1/2` already
used. No new scoring engine, no new rubric row.

**Task-type distribution** (metadata field `payload.task_type`, captured as
real queryable data, not just prose in the stem):

| task_type | count |
|---|---:|
| forum_contribution | 2 |
| semi_formal_email | 2 |
| formal_request | 2 |
| complaint | 2 |
| proposal | 2 |
| response_to_opinion | 2 |
| workplace_message | 2 |
| workplace_email | 2 |
| explain_problem | 2 |
| suggest_alternative | 2 |
| agree_disagree | 2 |
| give_reasons | 2 |
| compare_options | 2 |
| request_action | 2 |
| *(pre-existing practice-writing-1/2, no task_type set)* | 2 |

14 distinct task types, each represented at least twice, plus general-B2 and
workplace/professional contexts both covered throughout (not "every task is
a forum post").

**Register distribution:** informell/informell-bis-neutral, halbformell, and
formell are all represented, tied to what the situation actually calls for
(a Krankmeldung is halbformell/short; a formal Antrag is formell).

**Capability distribution** (only capabilities whose `experiences` include
`"writing"`):

| capability | count |
|---|---:|
| justify | 9 |
| structure | 9 |
| compare | 3 |
| argue | 3 |
| concede | 2 |
| speculate | 2 |
| adapt_register | 1 |
| exemplify | 1 |

One clear primary capability per task, never a multi-tag list.

**Difficulty distribution:** A 1 · B 24 · C 5.

**Word-range metadata:** every task carries `min_words`/`target_words`
(60–150 range depending on task type), with `min_words <= target_words` on
all 30 — enforced by an automated test.

**Rubric mapping:** 30/30 tasks carry `rubric_id=8`.

**Scoring honesty:** every LONG_TEXT item carries `answer=null` and
`answer_payload=null` (no manufactured key — `content_model.js`'s
`productive()` validator refuses one); `finishPaper()` reports
`scores.scorable=0` for these items, matching what `ExamPaper.jsx` already
shows: *"Your response was recorded. This task isn't automatically
scored."* No CEFR band, no Goethe/telc score, no percentage, no
"Wortvielfalt" metric anywhere in the response — verified by an automated
test that greps the finish response for exactly those fabricated-metric
strings.

**Duplicate/overlap audit:** no two writing prompts are identical (automated
test); none of the 28 new prompts reuses a Goethe/telc exam-paper prompt
(`seed_exam_papers.js`) or a `core-2026b` diagnostic prompt.

## Listening — 30 experiences, 107 items, 30 real audio assets

29 new experiences this pass (`practice-listening-2` .. `practice-listening-30`,
`seed_listening_bank.js`), on top of the 1 already live
(`practice-listening-1`, `seed_practice_bank.js`). All `board='custom'`,
`alignment='original'`, `source_type='ORIGINAL'`. Every one has real,
Azure Neural TTS audio — cut, registered in `b2_audio_assets`, and attached
via `tools/make_practice_audio.js` (extended this pass to also read
`seed_listening_bank.js`'s `ALL` array, not just `seed_practice_bank.js`'s
single `LISTENING_1`).

**Pipeline proven before scaling**: `practice-listening-2` (a voicemail —
the first format not already used by `practice-listening-1`'s team
conversation) was authored, seeded, synthesised, registered, attached and
browser-played/answered/scored end to end *before* the other 28 were
authored, per the brief's explicit requirement. Its MP3 (422 kB, 36.0s,
2.5 words/sec) was verified on disk, via `ffprobe`, via the API's `206
Partial Content` response, and via real playback in the browser (`<audio>`
element `duration`/`currentTime` inspected directly), then answered 4/4
correct.

**Format variety** (each appears 2× or more across the 30): conversation
between colleagues, workplace discussion, short interview, radio/podcast
excerpt, voicemail, announcement, phone conversation, planning discussion,
disagreement, advice conversation, service interaction, professional
conversation, opinion exchange, informal discussion, short presentation.

**Workplace/nursing subset**: a meaningful but minority slice —
`practice-listening-1` (Dienstplanänderung), `-15` (Übergabegespräch,
nursing handover), `-26` (Medikamentenplan, nursing), `-30` (Schichtwechsel,
nursing) are explicitly nursing; several more (`-11`, `-16`, `-23`) are
general workplace/professional without being nursing-specific. The broader
corpus stays general B2, not a nursing-only bank.

**Item-type variety:**

| item_type | count |
|---|---:|
| MCQ | 87 |
| TRUE_FALSE | 19 |
| ORDERING | 1 |

**Capability distribution** (only capabilities whose `experiences` array
includes `"listening"` were used — see the capability-taxonomy note below):

| capability | count |
|---|---:|
| understand_speech | 75 |
| justify | 17 |
| concede | 4 |
| speculate | 4 |
| ask_followup | 4 |
| compare | 2 |
| argue | 1 |

`understand_speech` is the majority (70%), honestly, because comprehension
*is* the primary demand of a listening item — but it is not the whole
corpus: 32 items (30%) evidence a specific comprehension sub-skill via one
of six other capabilities. `maintain_discussion` and `react_unexpected` are
never used: `src/b2/capabilities.js` documents both as trainable only
through live conversation (Maya), and an MCQ cannot exercise either — using
them here would have been exactly the "claim a complex speaking capability
from one MCQ" the brief warned against.

**Capability-taxonomy change**: `argue`, `justify`, `compare` and
`speculate` did not previously list `"listening"` in their `experiences`
array (only `concede` and `ask_followup` already did). This pass added
`"listening"` to those four, on the same basis `"reading"` was already
there for all of them: RECEPTIVE evidence (recognising an argument, a
reason, a comparison, or a suggestion *in spoken input*) for a capability
whose full form is productive — exactly as reading evidence already worked.
This is documented inline in `capabilities.js` at each of the four entries.

**Difficulty distribution:** A 32 · B 60 · C 15 — A is explicit stated
information at clear pace; B is normal pace with paraphrase or a minor
distraction; C is implicit meaning, attitude, multiple speakers, dense
information, or a changed plan revealed only through subtle wording.

**Distractor design**: built around the patterns the brief named —
information stated then later changed (a plan revised mid-dialogue),
plausible-but-unsupported interpretations, one speaker's detail attributed
to the wrong speaker, similar numbers/times, and cause-vs-consequence
confusion — varied across items rather than reusing one trick throughout.

**Audio metadata**: every section carries `audio_required=true`, a real
`audio_asset_id` (30/30 attached, 0 missing), a duration between 27.6s and
51.8s (all within the 30s–2min target), and a measured word-per-second pace
between 1.9 and 2.9 (natural B2 speaking pace, not artificially slowed) —
one clip (`practice-listening-28`) measured too fast on first cut (3.2 w/s)
and was regenerated with a −12% SSML rate on its turns.

**Transcript visibility**: `section.passage` is `null` for every listening
paper — `ExamPaper.jsx` only renders `ctx.text` for non-listening skills, so
the script is never shown to the learner as primary content. The full
script lives in `seed_listening_bank.js`'s `turns` arrays (audio
generation, QA, SME review, debugging) and nowhere in the servable payload.

**Duplicate/overlap audit**: no two scripts and no two item stems are
identical anywhere in the 30-paper listening corpus (source-level check,
also an automated test); no audio asset is registered under more than one
section id; topics were hand-checked against `core-2026b` V1/V2/V3's
Hören dialogues, `practice-listening-1`, and the Reading/Writing corpora
before authoring, and none repeats a complete dialogue or prompt (shared
vocabulary is expected and fine).

## Speaking Practice — 30 Maya conversations (26 new this pass)

**No new conversation engine.** This pass reuses `src/b2/maya.js` (the
server-authoritative FSM, session persistence, duplicate-submission
protection, and indicative-only evidence summariser) exactly as the 4
frozen scenarios (`maya_schichttausch`, `maya_homeoffice`, `maya_vorschlag`,
`maya_unerwartet`) already used it — none of those 4 files was touched.
26 new scenario files were added to `src/seed/b2/maya/`, each validated
against `maya.validateMayaScenario()`.

**The UI already existed and needed zero changes.** `components/steps/
Converse.jsx` (real `MediaRecorder` microphone capture → `/b2/speaking` →
Azure STT transcription, with a typing fallback when the mic is
unavailable/denied) and the curriculum-track discovery path
(`b2_curriculum.js`'s `trackOf()` already mapped any topic id containing
`"maya"` to `track: "speaking"`) were both fully built and working before
this pass — confirmed by inspection, not assumed. What was missing was
purely **content**: 26 more scenario files, 26 more `topics` rows
(`seed_b2_maya.js`), and a plumbing change so `routes/b2.js` discovers
scenario files from `src/seed/b2/maya/` automatically instead of via 4
hand-written `require()` lines — so a future scenario needs only a new
file, never a routes edit.

**Recording/transcription — verified, not assumed.** `speech.assess()`
(Azure Speech real-time recognition + pronunciation scoring) was tested
directly with a synthesised utterance and returned a real transcript,
confidence score, and word-level pronunciation data. `Converse.jsx`
deliberately uses only the transcript — pronunciation/fluency scores are
never surfaced to the learner, the same restraint the product already
applied elsewhere (no calibrated speaking band exists anywhere in Practice
Mode). The UI's own copy is accurate: *"Sie sprechen oder schreiben frei."*

**Format families** (per the brief's list, each represented): opinion +
pushback, negotiation, unexpected change, clarification, workplace
disagreement, planning, professional communication — spread across the 26
new scenarios rather than one family repeated 26 times.

**Nursing/workplace balance**: 4 explicitly nursing/healthcare scenarios
among the 26 new ones (`dienstplan_tausch2`, `patientenwunsch`,
`kollegin_ueberlastet`, `stationswechsel`, `uebergabe_unklar`,
`krankmeldung_kollege` — 6 by file, all purely communicative: no medical
decision, diagnosis, or medication judgement is ever asked of the learner),
alongside ~11 general-workplace and ~10 general-life scenarios — a
meaningful subset, not a nursing-only product.

**Capability distribution** (`capability_targets.primary`, all 30
scenarios — descriptive/pedagogical metadata, following the exact
convention the 4 frozen scenarios already established, e.g.
`maya_homeoffice` declares primary `"argue"` even though `argue` is not
one of the capabilities `maya.js`'s `summarise()` emits evidence for):

| primary capability | count |
|---|---:|
| justify | 7 |
| argue | 6 |
| concede | 4 |
| react_unexpected | 4 |
| ask_followup | 3 |
| adapt_register | 2 |
| maintain_discussion | 1 |
| speculate | 1 |
| compare | 1 |
| summarise | 1 |

All 10 capabilities the brief suggested appear at least once; none exceeds
23% of primaries (justify, the largest, is 7/30). `argue`/`justify`/
`compare`/`speculate` were added to their `experiences` arrays in
`src/b2/capabilities.js` (documented inline) on the same basis `"reading"`
was already there — receptive/interactive evidence for a productive
capability, never invented from nothing.

**Difficulty** (`declaration.cefr_tier`): accessible 4 · developing 20 ·
demanding 6 — accessible scenarios have a predictable, low-stakes
interaction (planning a house move, WG chores); demanding ones layer an
unexpected complication, a factual correction under criticism, or multiple
competing constraints onto the negotiation.

**Evidence discipline — unchanged, verified not weakened.** Every Maya
evidence row is still recorded at `weight=0.2`, `source_kind='conversation'`,
`dimension='speaking'` (`src/b2/profile.js`'s `conversation: 0.2` table,
untouched). `profile.getProfile()` still marks the `speaking` dimension
`indicative: true` unconditionally, so it is excluded from "measured"/
reliable-band logic regardless of how many Maya sessions a learner
completes — one conversation was never going to look like a reliable score,
and still doesn't. Duplicate submission (a reload, a double-tap on the
final turn) is still idempotent by `source_ref = "maya_<scenarioId>:
<sessionId>"` — verified with an automated test that re-submits a finishing
turn and confirms no second evidence row is written.

**Practice/exam separation**: Maya scenario ids never appear in `b2_papers`
(and vice versa) — verified by test. Maya has always been, and remains, a
parallel surface with its own `b2_maya_sessions` table, never mixed into
Exam Practice or the frozen `core-2026b` diagnostic.

## Grammar, Vocabulary, Workplace — unchanged this pass

- **Grammar**: 9 papers, 100 items.
- **Vocabulary**: 9 papers, 100 items.
- **Workplace**: 23 interview questions (`src/b2/interview.js`), not a
  `b2_papers` row — reuses the existing interview engine wholesale. Not
  reconnected or migrated this pass, per the brief's explicit scope; still
  reported by `tools/inventory.js` as "unreachable without Maya delivery",
  same as before.

## Provenance, audio, and audit coverage (whole custom practice bank)

- **Provenance**: every item across the entire `board='custom'` practice
  bank (excluding the diagnostic) is `source_type='ORIGINAL'` — 100%. None
  claims a Goethe/telc/book source.
- **Audio coverage**: all 30 Listening practice sections plus all three
  `core-2026b` diagnostic Hören sections have `audio_asset_id` attached and
  on disk (33 `b2_audio_assets` rows total: 30 `kind='practice'` + 3
  `kind='assessment'`), 0 missing; `gx_hoeren_t1` (the separate, frozen
  Goethe Hören Teil 1 exam engine) is intentionally out of scope for this
  table.
- **Content audit** (`node tools/b2_content_audit.js`): **0 FAIL, 0 WARN,
  42 NOTE** — the NOTE count is unchanged from before this pass; every NOTE
  is a previously-documented, intentional pattern (legacy DRAFT rows,
  deliberate anchor-item reuse across core-2026b V1/V2/V3, deliberate
  section reuse between a "complete" paper and its standalone components).
- **Test suite**: 863/863 passing (822 Reading/Writing-pass baseline + 13
  from `test/practice_reading_writing.test.js` + 12 from
  `test/practice_listening.test.js` + 16 new from this pass's
  `test/practice_speaking.test.js`, covering scenario-contract validation,
  duplicate/uniqueness checks, frozen-scenario integrity, capability/
  difficulty distribution, discovery, full-conversation serving,
  duplicate-submission idempotency, practice/exam separation, and the
  indicative-evidence guarantee).

## Two defects found and fixed during Listening verification

Neither is Listening-specific — both affect every skill's practice papers —
but both were only surfaced by this pass's required live browser
verification, so they are fixed here rather than left for later:

- **`Icon.jsx`'s Play triangle rendered invisibly.** The multi-subpath
  splitter (`d.split("M").filter(Boolean).map(seg => "M"+seg)`) only
  recognises uppercase `M`; the Play icon's path started with lowercase
  `m` (relative moveto), so it produced the invalid path
  `"Mm6 3 14 9-14 9z"`, silently dropped by the browser. Every Play button
  in the product — Listening included — showed the word "Play" with no
  visible triangle. Fixed by rewriting the path with absolute coordinates
  (`"M6 3 20 12 6 21z"`), verified visually in the browser before and
  after.
- **Refreshing on ANY exam/practice paper produced a permanent blank white
  page.** `B2App.jsx` persisted `screen="examPaper"` to `sessionStorage`
  but not the `examPaper` object (`{paperId,label,mode}`) the render guard
  also requires; after a reload the guard's second half was always false
  and every screen case in the file fell through with nothing rendered — no
  error, no way back except clearing storage by hand. This applied to
  every skill's papers, not just Listening. Fixed by persisting `examPaper`
  the same way `lesson` already was — a refresh now actually **resumes**
  the paper (verified live: refreshed mid-Listening-paper, landed back on
  the same question, finished normally).

## review_status note

Every row in this document is `AUTO_QA_PASS`: it passed `content_model.js`'s
structural validators and the content audit, and it is genuinely usable in
the product today. **No SME (subject-matter expert / teacher) has reviewed
any of it.** This document does not claim SME-readiness anywhere, per
instruction.
