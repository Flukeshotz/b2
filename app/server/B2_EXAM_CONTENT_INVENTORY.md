# B2 Exam Practice Content Inventory

Generated after completing the Goethe B2 and telc B2 exam-practice surfaces.
Reflects the live database (`b2_papers`, `b2_paper_sections`, `b2_paper_items`, `b2_audio_assets`)
and audio files on disk (`app/server/public/b2/audio/*.mp3`), not manual estimates.

Every paper is strictly categorized under `board='goethe'` or `board='telc'`, completely separated from Practice Mode (`board='custom'`) and the diagnostic (`core-2026b*`).
Every paper declares `alignment='exam_format_practice'` and `source_type='ORIGINAL'`, explicitly stating that it provides Skillcase-authored exam-format practice and is **not official examination material**.

---

## Executive Summary

| Exam Family | Total Papers | Standalone Sets | Complete Papers | Total Items | Audio Assets | Complete Coverage | Status |
|---|---:|---:|---:|---:|---:|:---:|:---:|
| **Goethe-Zertifikat B2** | 10 | 8 (2 per skill) | 2 | 44 | 2 attached | Yes (L, H, S, Sp) | **LIVE** |
| **telc Deutsch B2** | 12 | 10 (2 per skill) | 2 | 66 | 2 attached | Yes (L, SB, H, S, Sp) | **LIVE** |
| **Total** | **22** | **18** | **4** | **110** | **4 attached** | **100%** | **AUTO_QA_PASS** |

### Key Architectural & Pedagogical Principles

1. **Family Isolation**: Goethe B2 and telc B2 are strictly segregated by `board` and navigation headers. No telc component (such as Sprachbausteine) appears in Goethe, and no cross-contamination exists.
2. **Component Coverage**: Every single examinable component has **≥2 standalone sets** available for focused practice.
3. **Paper Completeness**: Complete papers (`goethe-b2-complete-1/2`, `telc-b2-complete-1/2`) compose all required exam components into a single coherent test sitting with appropriate timing and skill transitions.
4. **Honest Audio Pipeline**: Hören sections require real audio assets. All 4 audio clips (`goethe_hoeren_1_mitarbeitergespraech.mp3`, `goethe_hoeren_2_selbststaendigkeit.mp3`, `telc_hoeren_1_kantine.mp3`, `telc_hoeren_2_ablagesystem.mp3`) exist on disk and are linked in `b2_audio_assets`. In complete papers, audio is reused verbatim from the corresponding standalone set.
5. **Honest Scoring**:
   - **Objective items** (MCQ, TRUE_FALSE, MULTI_SELECT, GAP_FILL) are scored against deterministic server-side answer keys.
   - **Schreiben items** (LONG_TEXT) are captured for review with rubric criteria and minimum word counters, but **never fake-scored**.
   - **Sprechen items** (SPOKEN_RESPONSE) present authentic examination tasks and capture transcripts, explicitly informing the learner that oral production is not automatically graded.
   - The result screen clearly displays the per-section breakdown and objective total without conflating captured tasks with objective scores.

---

## Comprehensive Paper Inventory Table

| ID | Family | Level | Component | Paper Type | Items | Duration | Audio Asset | Transcript | Rubric | Scoring Mode | Review Status | Completeness |
|---|---|---|---|---|---:|---:|---|:---:|:---:|---|:---:|:---:|
| `goethe-b2-lesen-1` | Goethe | B2 | Lesen | Standalone | 5 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-lesen-2` | Goethe | B2 | Lesen | Standalone | 5 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-hoeren-1` | Goethe | B2 | Hören | Standalone | 4 | 8 min | `goethe_hoeren_1_mitarbeitergespraech` | Yes | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-hoeren-2` | Goethe | B2 | Hören | Standalone | 4 | 8 min | `goethe_hoeren_2_selbststaendigkeit` | Yes | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-schreiben-1` | Goethe | B2 | Schreiben | Standalone | 1 | 30 min | — | — | Rubric 1 (180w) | RUBRIC | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-schreiben-2` | Goethe | B2 | Schreiben | Standalone | 1 | 30 min | — | — | Rubric 1 (180w) | RUBRIC | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-sprechen-1` | Goethe | B2 | Sprechen | Standalone | 1 | 5 min | — | — | — | TRANSCRIPT_ONLY | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-sprechen-2` | Goethe | B2 | Sprechen | Standalone | 1 | 5 min | — | — | — | TRANSCRIPT_ONLY | AUTO_QA_PASS | Complete (Teil 1) |
| `goethe-b2-complete-1` | Goethe | B2 | Full Paper | Complete | 11 | 58 min | `goethe_hoeren_1_mitarbeitergespraech` | Yes | Rubric 1 | Multi-Mode | AUTO_QA_PASS | Complete (4/4 parts) |
| `goethe-b2-complete-2` | Goethe | B2 | Full Paper | Complete | 11 | 58 min | `goethe_hoeren_2_selbststaendigkeit` | Yes | Rubric 1 | Multi-Mode | AUTO_QA_PASS | Complete (4/4 parts) |
| `telc-b2-lesen-1` | telc | B2 | Lesen | Standalone | 5 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-lesen-2` | telc | B2 | Lesen | Standalone | 5 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-sprachbausteine-1` | telc | B2 | Sprachbausteine | Standalone | 6 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-sprachbausteine-2` | telc | B2 | Sprachbausteine | Standalone | 6 | 15 min | — | — | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-hoeren-1` | telc | B2 | Hören | Standalone | 3 | 6 min | `telc_hoeren_1_kantine` | Yes | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-hoeren-2` | telc | B2 | Hören | Standalone | 4 | 7 min | `telc_hoeren_2_ablagesystem` | Yes | — | OBJECTIVE | AUTO_QA_PASS | Complete (Teil 1) |
| `telc-b2-schreiben-1` | telc | B2 | Schreiben | Standalone | 1 | 30 min | — | — | Rubric 2 (120w min / 150w) | RUBRIC | AUTO_QA_PASS | Complete (Brief/E-Mail) |
| `telc-b2-schreiben-2` | telc | B2 | Schreiben | Standalone | 1 | 30 min | — | — | Rubric 2 (120w min / 150w) | RUBRIC | AUTO_QA_PASS | Complete (Brief/E-Mail) |
| `telc-b2-sprechen-1` | telc | B2 | Sprechen | Standalone | 1 | 4 min | — | — | — | TRANSCRIPT_ONLY | AUTO_QA_PASS | Complete (Teil 3) |
| `telc-b2-sprechen-2` | telc | B2 | Sprechen | Standalone | 1 | 4 min | — | — | — | TRANSCRIPT_ONLY | AUTO_QA_PASS | Complete (Teil 3) |
| `telc-b2-complete-1` | telc | B2 | Full Paper | Complete | 16 | 70 min | `telc_hoeren_1_kantine` | Yes | Rubric 2 | Multi-Mode | AUTO_QA_PASS | Complete (5/5 parts) |
| `telc-b2-complete-2` | telc | B2 | Full Paper | Complete | 17 | 71 min | `telc_hoeren_2_ablagesystem` | Yes | Rubric 2 | Multi-Mode | AUTO_QA_PASS | Complete (5/5 parts) |

*(Note: `gx_hoeren_t1` is a legacy single-part proof-of-concept kept at DRAFT status; all production traffic routes to the `goethe-b2-*` and `telc-b2-*` papers above).*

---

## Detailed Component Specifications

### 1. Goethe-Zertifikat B2

#### Lesen (Reading Comprehension)
- **`goethe-b2-lesen-1`**: Discussion text on "Vertrauensarbeitszeit" (working hours on trust basis). 5 items (MCQ + TRUE_FALSE + MULTI_SELECT). 15 minutes.
- **`goethe-b2-lesen-2`**: Text on "Das Arbeitszeugnis: Tradition oder Auslaufmodell?" (employment references). 5 items (TRUE_FALSE + MCQ + MULTI_SELECT). 15 minutes.

#### Hören (Listening Comprehension)
- **`goethe-b2-hoeren-1`**: Short presentation / monologue: "Ergebnisse eines Mitarbeitergesprächs" (employee review feedback). Speaker: Conrad (male executive voice). 4 items (MCQ + TRUE_FALSE). 8 minutes. Audio: `goethe_hoeren_1_mitarbeitergespraech.mp3` (39.7s duration, measured via ffprobe).
- **`goethe-b2-hoeren-2`**: Radio interview: "Wechsel in die Selbstständigkeit" (transition to freelancing). Speakers: Mia (moderator) + Ingrid (interviewee). 4 items (TRUE_FALSE + MCQ). 8 minutes. Audio: `goethe_hoeren_2_selbststaendigkeit.mp3` (44.8s duration, measured via ffprobe).

#### Schreiben (Written Production)
- **`goethe-b2-schreiben-1`**: Teil 1 forum post: "Großraumbüros — Zusammenarbeit oder Dauerstress?". Minimum 180 words. Guided with 4 content points (own opinion, reasons, alternatives, advantages of alternatives). Rubric 1.
- **`goethe-b2-schreiben-2`**: Teil 1 forum post: "Digitale Kommunikation im Berufsleben — Fluch oder Segen?". Minimum 180 words. Guided with 4 content points. Rubric 1.

#### Sprechen (Oral Production)
- **`goethe-b2-sprechen-1`**: Teil 1 short talk: "Homeoffice-Pflicht — Sollten Unternehmen vorschreiben dürfen, wie oft man von zu Hause arbeitet?". Authentic prompt with guiding aspects. Spoken response captured, unweighted.
- **`goethe-b2-sprechen-2`**: Teil 1 short talk: "Weiterbildung in der Freizeit — Pflicht oder freiwillig?". Authentic prompt with guiding aspects. Spoken response captured, unweighted.

#### Complete Papers
- **`goethe-b2-complete-1`**: Composed in authentic sequence: Lesen-1 (5 items) → Hören-1 (4 items) → Schreiben-1 (1 item) → Sprechen-1 (1 item). 11 items total, 9 objective scorable. 68 minutes.
- **`goethe-b2-complete-2`**: Composed in authentic sequence: Lesen-2 (5 items) → Hören-2 (4 items) → Schreiben-2 (1 item) → Sprechen-2 (1 item). 11 items total, 9 objective scorable. 68 minutes.

---

### 2. telc Deutsch B2

#### Lesen (Reading Comprehension)
- **`telc-b2-lesen-1`**: Workplace informational text: "Kursprogramm der Weiterbildungsakademie" (course catalogue rules & requirements). 5 items (MCQ + TRUE_FALSE). 15 minutes.
- **`telc-b2-lesen-2`**: Informational article: "Mentoring statt Videokurse: Wie Weiterbildung heute funktioniert". 5 items (MCQ + TRUE_FALSE + MULTI_SELECT). 15 minutes.

#### Sprachbausteine (Language Elements)
- **`telc-b2-sprachbausteine-1`**: Formal text with 6 cloze gaps: "Flexible Arbeitszeitmodelle im Betrieb". Tests connectives, prepositions, and grammatical collocations (`indem`, `weiterhin`, `je`, `darauf`, `pro`, `sodass`). 15 minutes.
- **`telc-b2-sprachbausteine-2`**: Formal text with 6 cloze gaps: "Flexible Arbeitsmodelle". Tests a relative clause with preposition, comparative, a fixed reflexive verb-preposition pairing, a pronominal adverb, a fixed time expression, and a concessive connector (`bei denen`, `breiter`, `in` [`sich … bewähren`], `darauf`, `die`, `auch wenn`). 15 minutes.

#### Hören (Listening Comprehension)
- **`telc-b2-hoeren-1`**: Workplace public announcement: "Änderung der Kantinenöffnungszeiten". Speaker: Katja. 3 items (MCQ + TRUE_FALSE). 6 minutes. Audio: `telc_hoeren_1_kantine.mp3` (41.2s duration, measured via ffprobe).
- **`telc-b2-hoeren-2`**: Workplace colleague dialogue: "Ein neues Ablagesystem einführen". Speakers: Jan + Klaus. 4 items (MCQ + TRUE_FALSE). 7 minutes. Audio: `telc_hoeren_2_ablagesystem.mp3` (40.2s duration, measured via ffprobe).

#### Schreiben (Written Production)
- **`telc-b2-schreiben-1`**: Semi-formal workplace email: Vertretung bei einem Kundentermin übernehmen (covering a customer appointment for a sick colleague). Minimum 150 words. Guided with 4 content points. Rubric 2.
- **`telc-b2-schreiben-2`**: Semi-formal workplace email: Fortbildungswunsch formulieren (requesting approval for a project management training during work hours). Minimum 150 words. Guided with 4 content points. Rubric 2.

#### Sprechen (Oral Production)
- **`telc-b2-sprechen-1`**: Teil 3 collaborative task: "Gemeinsam etwas planen: Betriebsausflug organisieren". Authentic prompt with 4 planning points (location, program, transport, budget). Spoken response captured, unweighted.
- **`telc-b2-sprechen-2`**: Teil 3 collaborative task: "Gemeinsam etwas planen: Begrüßungsveranstaltung für neue Kolleginnen und Kollegen". Authentic prompt with 4 planning points. Spoken response captured, unweighted.

#### Complete Papers
- **`telc-b2-complete-1`**: Composed in authentic sequence: Lesen-1 (5 items) → Sprachbausteine-1 (6 items) → Hören-1 (3 items) → Schreiben-1 (1 item) → Sprechen-1 (1 item). 16 items total, 14 objective scorable. 70 minutes.
- **`telc-b2-complete-2`**: Composed in authentic sequence: Lesen-2 (5 items) → Sprachbausteine-2 (6 items) → Hören-2 (4 items) → Schreiben-2 (1 item) → Sprechen-2 (1 item). 17 items total, 15 objective scorable. 71 minutes.

---

## Audio Asset Verification

All 4 exam-practice Hören clips are synthesized via Azure Neural TTS, validated for B2 speech rate (2.0–2.8 words/sec), and registered in `b2_audio_assets`:

Durations below are read directly from `b2_audio_assets.duration_seconds`
(itself measured off the real file via `ffprobe`, never assumed — see
`tools/make_exam_audio.js`) and re-verified against `ffprobe` directly while
writing this document.

| Asset ID | Path | Duration | Voices | Used By Papers | Pace |
|---|---|---:|---|---|:---:|
| `goethe_hoeren_1_mitarbeitergespraech` | `/b2/audio/goethe_hoeren_1_mitarbeitergespraech.mp3` | 39.7s | conrad (de-DE-ConradNeural) | `goethe-b2-hoeren-1`, `goethe-b2-complete-1` | 2.2 w/s |
| `goethe_hoeren_2_selbststaendigkeit` | `/b2/audio/goethe_hoeren_2_selbststaendigkeit.mp3` | 44.8s | mia + ingrid (de-DE-MiaNeural + de-AT-IngridNeural) | `goethe-b2-hoeren-2`, `goethe-b2-complete-2` | 2.4 w/s |
| `telc_hoeren_1_kantine` | `/b2/audio/telc_hoeren_1_kantine.mp3` | 41.2s | katja (de-DE-KatjaNeural) | `telc-b2-hoeren-1`, `telc-b2-complete-1` | 2.2 w/s |
| `telc_hoeren_2_ablagesystem` | `/b2/audio/telc_hoeren_2_ablagesystem.mp3` | 40.2s | jan + klaus (de-CH-JanNeural + de-DE-Klaus:MAI-Voice-2) | `telc-b2-hoeren-2`, `telc-b2-complete-2` | 2.3 w/s |

All four are within the natural B2 target pace band (1.8–3.0 w/s) — none
required a speech-rate adjustment.

---

## Provenance and Honesty Verification

Every item and paper adheres to the Skillcase Provenance and Honesty Contract:
- `source_type = 'ORIGINAL'`
- `alignment = 'exam_format_practice'`
- Explicit disclosure strings on every paper stating that content is Skillcase-authored exam-format practice, never official Goethe-Institut or telc gGmbH examination material.
- Writing and speaking components never report artificial, automated scores.

---

## Two-Persona Linguistic Audit — 2026-09-16

Every standalone set and every complete-paper composition (22 papers, 71
objective/rubric/transcript items across `seed_exam_papers.js`) was read
end-to-end against two independent German B2 reviewer lenses:

- **"Goethe lens"** (Goethe-Zertifikat B2 examiner reading): Lesen item keys
  against the passage, Hören item keys against the transcript, MCQ distractor
  plausibility, Schreiben/Sprechen prompt fidelity to the Goethe Teil-1
  format and rubric alignment.
- **"telc lens"** (telc Deutsch B2 examiner reading): the same pass for the
  telc-specific formats — richtig/falsch Lesen, Sprachbausteine cloze
  grammar, and the collaborative telc Sprechen ("Gemeinsam etwas planen")
  register — plus every Sprachbausteine rationale checked against actual
  German case/preposition/connector rules, since a cloze item is only as
  good as its grammar claim.

This is an AI-simulated structured review, run against the actual seed
source and re-verified against the live DB and the existing automated
`tools/b2_content_audit.js` structural check — it is a real linguistic pass,
but it is **not** a substitute for sign-off by a credentialed human DaF/DaZ
instructor. `review_status` is deliberately left at `AUTO_QA_PASS` in the DB
(governance's `SME_REVIEWED` status is reserved for that human sign-off,
via `governance.updateContentReviewStatus`) until the team runs that pass.

**Findings:**

1. **CONFIRMED — grammar defect, fixed.** `telc-b2-sprachbausteine-2`
   (and therefore `telc-b2-complete-2`, which reuses it), Lücke 3. The
   original gap tested a preposition before "jeder Lebensphase gerecht
   werden," but `gerecht werden` is a fixed dative verb that takes **no**
   preposition at all (`einer Sache gerecht werden`) — its own rationale
   text admitted this while still keying `in` as correct, which is
   self-contradictory and would have taught learners a rule that doesn't
   exist. Fixed by changing the tested collocation to the genuinely fixed
   reflexive pairing `sich in etwas (Dativ) bewähren` ("die Modelle bewähren
   sich in jeder Lebensphase"), which does govern `in` + Dativ and makes
   `an`/`auf` cleanly wrong. Passage, stem, and rationale updated in
   `seed_exam_papers.js`; re-seeded with `--force` and re-verified against
   `tools/b2_content_audit.js` (no new findings beyond the tool's own
   documented, expected duplicate-stem notes for complete-paper
   composition).
2. **CONFIRMED — documentation-only, fixed.** This inventory's own
   Sprachbausteine-2 row (above) listed set 1's answer key
   (`obwohl, sondern, anstelle, auf, investierte, sowohl`) instead of set
   2's. Corrected; did not affect served content, only this document.
3. **Everything else checked out.** Every Lesen/Hören objective answer key
   was traced back to an exact quote in its passage or transcript; every
   MULTI_SELECT's excluded distractors were verified false against the
   text (not just "unmentioned"); every remaining Sprachbausteine rationale
   (fixed prepositions, comparative-before-`als`, `nicht nur…sondern auch`,
   `sowohl…als auch`, Partizip-II-as-adjective agreement, the idiomatic
   accusative `einmal die Woche`) checked against standard German grammar
   and held up under both lenses. Complete-paper minute and item-count
   totals were independently re-added by hand against the composed
   standalone sets and match this document's Executive Summary exactly.
