# Skillcase B2 — Product Requirements (practice & test loop)

| | |
|---|---|
| **Product** | Skillcase B2 — German B2 exam prep (Goethe-Zertifikat B2, telc Deutsch B2) |
| **Status** | Screens built and running; handed over for engineering completion |
| **Updated** | 2026-09-23 |
| **Read with** | `HANDOVER.md` (how to run, code map) · `content/README.md` (content format) |

This document says **what the product must do and why**, screen by screen,
with acceptance criteria, states, the API each screen uses, and the rules
behind every number shown. Where the build and the intent differ, both are
written down — look for **GAP**.

---

## 1. Problem

B2 learners — mostly nurses working toward professional recognition in
Germany, studying in short sessions around shifts — need to know three
things: *where do I stand, what should I practise, and am I improving?*

The previous B2 app offered a flat list of practice material. A diagnostic
test existed but was buried, its result was never shown again, retesting
meant sitting the same paper, and nothing connected a weak result to the
practice that would fix it.

## 2. Goals

1. **Measure** — a 15-minute test, taken first, that shows the learner
   where she stands per skill.
2. **Direct** — turn the result into specific practice suggestions.
3. **Re-measure** — ten comparable test versions, so every retest is new
   content but the scores can be compared.
4. **Organise** — all practice under four skills (Reading, Listening,
   Writing, Speaking); complete mock exams kept separate.
5. **Monetise later** — a detailed report as a future Premium feature,
   visible but locked.

### Success metrics (proposed — nothing is tracked yet, see §13)

| Metric | Definition | Target to set |
|---|---|---|
| Test-first activation | % of new learners who finish Test 1 in their first session | — |
| Practice after test | % who open a "Practise next" paper within 24 h of a test | — |
| Retest rate | % who take Test 2 within 14 days of Test 1 | — |
| Score movement | median change in overall % between consecutive comparable tests | — |
| Premium intent | taps on a locked "Detailed report" per test finished | — |

## 3. Non-goals

- **No official score.** The product never claims a Goethe/telc score,
  CEFR level or pass probability (`forbiddenClaims` in
  `server/src/seed/b2/core2026b/blueprint.js`). Every result is "Skillcase
  practice, not an official score".
- **No payments** in this scope (§11).
- **No German Jobs / German Classes** features — the tabs are visual only.
- **No streaks, coins or reward economy** (that is A1's product, not B2's).

## 4. Users

| Persona | Situation | What she needs from B2 |
|---|---|---|
| Nurse, Anerkennung track | B1 done, B2 needed for licence, shift work | Short sessions, clear "do this next", workplace-relevant German |
| Exam taker | Booked Goethe or telc B2 | Real exam formats, full timed mock papers |
| Job applicant | Has B2, preparing for interviews | Speaking practice (interview track — out of scope here) |

---

## 5. User flows

### 5.1 Intended flow

```
Sign up → Onboarding (3 questions) → Test 1 (15 min) → Result
       → Home → Practise suggested topics → Retest (Test 2…10) → compare
```

### 5.2 Current build

```
Sign up → Home ──┬─ "Take a test…" banner → Test → Result → Home
                 ├─ Skill tile → skill practice list → paper → answers
                 ├─ Exam Papers "Start" → full paper list → paper
                 └─ "Your last test" banner → Test screen → next test / practise next
```

**GAP 1 — onboarding is not reachable.** The screens exist
(`B2App.jsx` screens `intro` → `onboarding` → `check`), but the app opens
on `home` and nothing navigates to `intro`. The onboarding also routes to
the older `Check.jsx`, not the `core-2026b` test. To match the intended
flow: first launch (no completed test) → `intro` → `onboarding` →
`assessment` → `assessmentResult` → `home`; store the three onboarding
answers on the profile (the goal answer already selects the exam board —
see `boardFor()` in `B2App.jsx`).

---

## 6. Screens

Each screen lists purpose, content (top to bottom), states, acceptance
criteria and API calls. File paths are under `client/src/screens/b2/`.

### 6.1 Home — `B2Home.jsx`

**Purpose:** entry point; one glance at test status, then practice.

**Content**
1. Navbar (navy, 64 px): "B2 German Level" / "Goethe & telc exam prep";
   right: plan pill ("Free Plan") + avatar.
2. Mode tabs: **Job Preparation** (active) · German Jobs · German Classes
   (inert).
3. Test banner (light-blue card, Maya image, title, subtitle, chevron):
   - no completed test → "Take a test to check where you stand" → starts
     the test.
   - has a result → "Your last test: 25%" / "See your score and take the
     next one" (+ ▲/▼ points vs previous comparable test) → Test screen.
4. Practice grid, 2×2: Reading · Listening · Writing · Speaking. Each tile:
   photo, name, "N Übungen · short description" → skill practice list.
5. "Full Exam Papers" section: navy banner "Timed Full Length Papers",
   "Goethe & telc · 4 available", gold **Start** → full paper list.

**States**
| State | Behaviour |
|---|---|
| Loading | skeleton blocks |
| API error | "Couldn't load practice data…" + Try again |
| Never tested | banner shows "Take a test…" |
| Tested | banner shows last score |

**Acceptance criteria**
- [ ] No score breakdown on Home — only the single overall % in the banner.
- [ ] Tile counts equal the number of papers + lessons that tile opens.
- [ ] Full exam papers never appear inside a skill tile, and practice
      papers never appear under Full Exam Papers.
- [ ] No A1-switch button in the navbar.

**API:** `GET /api/b2/curriculum`, `/practice/counts`, `/paper/complete`,
`/assessment/progress`, `/assessment/current-diagnostic`,
`/practice/suggested`.

### 6.2 Skill practice list — `B2Home.jsx` (track view)

**Purpose:** everything to practise for one skill.

**Content**
1. Back · skill name · "N Übungen & Themen".
2. **Suggested** row (only after a test): one compact row — paper title,
   "Suggested · <capability>", arrow. Never more than one row.
3. Filter pills: Alle · Goethe B2 · telc B2 · Sprachbausteine (Reading
   only, telc papers only) · Übungen (Skillcase papers) · Themen (lessons).
4. List rows: title, board chip (Goethe B2 / telc B2 / Sprachbausteine /
   Grammatik / Wortschatz / Übung / Thema), "N Aufgaben · N Min".

**Rules:** Reading lists reading **and** grammar **and** vocabulary papers
(there are no separate Grammar/Vocabulary tiles).

**Acceptance criteria**
- [ ] Every practice paper appears under exactly one skill.
- [ ] Suggested row takes one row's height and is absent before a first test.
- [ ] "Sprachbausteine" label only on telc papers.

**API:** `GET /api/b2/practice/skill/:skill`.

### 6.3 Full exam papers — `B2Home.jsx` (showPapers view)

**Content:** Back · "Full Exam Papers" · filter Alle / Goethe B2 / telc B2 ·
rows with board chip, modules (Hören • Lesen • Schreiben • …),
"N Abschnitte · N Aufgaben · N Min".

**Acceptance criteria**
- [ ] Only complete multi-module papers (`id` contains `-complete-`).
- [ ] No bottom button; Back only at top.

**API:** `GET /api/b2/paper/complete`.

### 6.4 Doing a paper + answers — `ExamPaper.jsx`

**Purpose:** answer a practice or exam paper, then see answers and
explanations.

**Content (per question):** progress bar · "N of M" · reading passage or
audio player (first question of a section) · question · answer input ·
footer: "Skip — doesn't count as wrong" + Next / Finish.

| Item type | Input |
|---|---|
| MCQ, TRUE_FALSE, MULTI_SELECT | choice rows |
| LONG_TEXT (writing) | textarea + live "N / min words"; Next enabled at min words |
| SPOKEN_RESPONSE (speaking) | message "not recorded yet, not scored" — Skip only (**GAP 3**) |

**Listening:** in `mode="exam"` the audio plays once ("Played once"); in
`mode="practice"` it replays freely.

**Result screen:** "Result" · "X of Y correct. This is Skillcase practice,
not an official score." · per-section breakdown (multi-module papers) ·
**Antworten & Erklärungen**: one card per question — ✓ Richtig / ✗ Falsch /
Erfasst, question, "Ihre Antwort", "Richtige Antwort" (when wrong),
"Erklärung".

**States:** loading skeleton · save/submit error message with retry ·
refresh resumes the open attempt (server returns `resumed: true`).

**Acceptance criteria**
- [ ] Skipped questions are never marked wrong.
- [ ] Every objective question shows the correct answer when answered wrong.
- [ ] Refresh mid-paper resumes, never starts a second attempt.

**GAP 2 — listening mode from skill lists.** Papers opened from Home's skill
lists use `mode="exam"` (audio once); papers opened from "Practise next" use
`mode="practice"`. Practice lists should almost certainly be `practice`.

**API:** `POST /api/b2/paper/:paperId/start` → `PUT
/paper/attempt/:attemptId/item/:itemId` `{response}` → `POST
/paper/attempt/:attemptId/finish`.

### 6.5 Test screen — `TestHub.jsx`

**Purpose:** everything about the learner's tests, test-first.

**Content**
1. **Take your next test** (navy hero): "TEST N OF 10", "Take your next
   test", "15 minutes · Reading, Listening, Writing, Speaking", gold
   **Start test**. Hidden when all 10 are completed.
2. **Your last test** (card): small ring with overall %, "Test N · date";
   four skill bars — Reading, Listening, Writing, Speaking (colour by band,
   §7); Writing and Speaking show "Not measured yet"; one-line summary
   ("Grammar is coming along. Reading and Listening need more practice.");
   locked row **Detailed report · Item-by-item breakdown · PREMIUM** —
   tapping shows the placeholder note (§11).
3. **Practise next**: up to 3 rows (title, "Skill · capability", arrow),
   weakest skill first → opens the paper in practice mode; Back returns here.
4. **Previous tests**: one row per earlier completed test — score %
   (coloured), "Test N", date, lock pill "Report".

**States**
| State | Behaviour |
|---|---|
| Loading | skeletons |
| Error | "Couldn't load your tests…" + Try again |
| No completed test | "You haven't taken a test yet…" + "Take your first test" |
| All 10 done | hero hidden, no "you've sat every version" text |
| Writing/Speaking not scored | "Not measured yet", no bar |

**Acceptance criteria**
- [ ] Taking the test is the first thing on screen.
- [ ] Only basic scores are free: overall % and per-skill %. Item-level
      detail is behind the locked row.
- [ ] Previous tests show their score; their report is locked.
- [ ] No bottom Done button.
- [ ] No fabricated Writing/Speaking percentage.

**API:** `GET /assessment/history`, `/assessment/current-diagnostic`,
`/assessment/progress`, `/practice/suggested`.

### 6.6 Taking the test — `Assessment.jsx`

**Purpose:** the 15-minute diagnostic.

**Content:** 24 questions, one per screen, in section order: Lesen (6) →
Hören (5, audio played once) → Sprachbausteine (9: grammar, vocabulary,
one discourse item) → Schreiben (2 short + 1 long) → Sprechen (1).
Skip allowed everywhere.

**Rules**
- The server picks the version: the lowest-numbered version the learner
  has not completed (`assessment_store.currentDiagnosticVersion`). A
  learner never sees the same version twice.
- An open attempt is resumed on refresh or re-entry, never duplicated.

**GAP 3 — speaking cannot be answered.** The speaking item has no recorder;
it can only be skipped. Port the recorder from `Interview.jsx` and score
with `server/src/b2/speech.js` (already used by interview practice).

**GAP 4 — writing is captured but not scored.** Text answers are saved but
excluded from the score. Deterministic writing checks exist in
`server/src/b2/task_profiles.js` (used by `/api/b2/produce`).

**API:** `GET /assessment/current-diagnostic` → `POST /assessment/start`
`{version}` → `PUT /assessment/:id/item/:itemId` `{response}` or `{skip:true}`
→ `POST /assessment/:id/finish`.

### 6.7 Test result — `AssessmentResult.jsx`

**Content:** "Your result" · ring with number measured · "Where you stand"
· "N questions measured, N skipped. This is a diagnostic sitting, not an
exam score." · "What we measured" per skill ("3 von 5") · "Not measured
yet" list · link "See where you stand (Report)" · **Done** → Home.

### 6.8 Detailed report — `Report.jsx`

**Purpose:** the future Premium report. Today reachable only from the test
result screen.

**Content:** large ring (overall %) · "Assessment progress" (change vs
previous comparable test, or why no comparison yet) · skill bars for all
six dimensions (reading, listening, grammar, vocabulary, writing, speaking —
blended evidence, not just the last test) · **What went well** (best
measured skill) / **Try to improve** (weakest) · capabilities breakdown ·
one recommended lesson.

**API:** `GET /api/b2/report`.

---

## 7. Scoring rules

| Rule | Value | Source |
|---|---|---|
| Overall test score | correct ÷ measured, over reading, listening, grammar, vocabulary items | `assessment_progress.js` |
| Skipped item | not measured — never counted wrong | same |
| Writing, speaking | excluded from the score (no answer key) | `isCore()` |
| Per-skill score | correct ÷ measured within that skill | `bySkill` |
| Colour band — good (green) | ≥ 62 % | `profile.js` |
| Colour band — developing (amber) | ≥ 42 % | `profile.js` |
| Colour band — needs practice (red) | < 42 % | `profile.js` |
| Change vs previous test | shown only if both tests are comparable versions and enough items were measured; under 5 points = "no clear change" | `assessment_progress.js` (`NOISE = 0.05`) |
| Per-skill comparison | needs ≥ 3 measured items in that skill in both tests | `MIN_PER_SKILL` |

The one-line summary groups the test's skills by band: "X is good. Y is
coming along. Z needs more practice."

## 8. Suggestion rules — `server/src/b2/suggest.js`

1. Take the latest test's per-capability scores; weakness = 1 − score for
   every capability with at least one measured item.
2. For each Home skill, score every practice paper by how much of its
   content targets weak capabilities (weighted, divided by paper size).
3. Papers the learner has already finished drop to the bottom.
4. Return the single best paper per skill (`PER_MODULE = 1`).
5. The Test screen orders skills weakest-first (unscored skills last) and
   shows up to 3; each skill list shows its own one.
6. No test yet → no suggestions (nothing is invented from zero evidence).

## 9. Content

| Content | Count | Where |
|---|---|---|
| Placement tests (core-2026b, comparable) | 10 × 24 items | `content/1-placement-test/` |
| Practice papers | 283 (reading 85, listening 53, writing 79, speaking 66) | `content/2-practice/` |
| Full mock exams | 4 (2 Goethe, 2 telc) | `content/3-full-exam-papers/` |
| Guided lessons | 57 | `content/4-lessons/` |
| Interview questions | 23 | `content/8-interview-practice/` |

**Test blueprint (all 10 identical in structure):** 24 items — reading 6,
listening 5, grammar 5, vocabulary 4, writing 3, speaking 1; 35 %
knowledge / 65 % skill; same capability and difficulty mix. Themes: v1
meetings · v2 office tech · v3 team days · v4 customer complaints · v5 home
office · v6 shift swaps · v7 training budget · v8 office move · v9 staff
review · v10 business travel. Audited by `tools/audit_b2_core_2026b.js`
(0 fail).

**Answers:** every objective item has an answer key and a German
explanation. Every writing/speaking task has `guidance` and an
`expected_answer` (AI-drafted, **unreviewed**).

**Quality status:** structurally audited; **no native-speaker review yet**.

## 10. API reference (screens above)

All under `/api/b2`, all require `Authorization: Bearer <token>` from
`POST /api/auth/signup` or `/api/auth/login`.

`GET /assessment/progress`
```json
{
  "latest": {
    "attemptId": 2293, "version": "core-2026b-v3", "completedAt": "2026-09-22T12:17:07Z",
    "score": 0.25, "measured": 16, "correct": 4, "skipped": 4,
    "bySkill": {
      "reading":   { "measured": 6, "correct": 1, "skipped": 0, "score": 0.167 },
      "listening": { "measured": 4, "correct": 0, "skipped": 1, "score": 0 },
      "grammar":   { "measured": 5, "correct": 3, "skipped": 0, "score": 0.6 },
      "vocabulary":{ "measured": 1, "correct": 0, "skipped": 3, "score": 0 }
    },
    "byCapability": { "structure": { "measured": 3, "correct": 0, "score": 0 } }
  },
  "previous": null,
  "delta": null,
  "reason": "No improvement comparison yet — this is the first assessment."
}
```
When comparable: `delta = { value, direction: "up"|"down"|"flat", basis, claim }`.

`GET /assessment/history` — newest first, includes in-progress:
```json
[{ "attemptId": 2293, "version": "core-2026b-v3", "startedAt": "…",
   "completedAt": "…", "status": "completed", "measured": 16, "skipped": 8, "score": 0.25 }]
```

`GET /assessment/current-diagnostic` → `{ "version": "core-2026b-v4", "exhausted": false }`
(`version: null, exhausted: true` after all 10).

`GET /practice/suggested`
```json
{
  "available": true,
  "focus": [{ "capability": "structure", "label": "Structure what you say", "score": 0 }],
  "modules": {
    "listening": [{ "paperId": "goethe-b2-hoeren-2", "title": "Goethe-Zertifikat B2 — Hören, Übungsset 2",
                    "board": "goethe", "capability": "understand_speech",
                    "why": "Follow real spoken German", "done": false }]
  }
}
```

`GET /practice/counts` → `{ "reading": 85, "listening": 53, "writing": 79, "speaking": 66 }`

`GET /practice/skill/:skill` → `[{ id, board, title, minutes, section_count, item_count, modules[], skills[] }]`

`GET /paper/complete` → same row shape, complete papers only.

`POST /paper/:id/start` → `{ attemptId, paperId, status, context, items[], resumed }`
(items carry no answer keys). Errors: `unknown_paper`, `paper_not_ready`.

`POST /paper/attempt/:id/finish` →
`{ scores: { total, answered, scorable, correct }, graded: [{ itemId, skill, itemType, answered, correct, stem, options, userAnswer, correctAnswer, rationale }] }`

`POST /assessment/:id/finish` → result:
`{ measured, skipped, correct, measuredAreas[], notMeasured[], stronger[], practiseNext[], recommendation, claim: "Assessment result", notAnExamScore: true }`

## 11. Premium — placeholder

"Detailed report" (latest and previous tests) shows a lock and a Premium
badge. Tapping shows: *"A deeper, item-by-item report is planned but not
yet available to buy — this screen doesn't process payments."*

To make it real:
1. Decide what Premium unlocks (item-level report for all tests? only
   older tests?) and whether it is a subscription or per-report.
2. Add a payment provider and an entitlement flag on the user.
3. Enforce server-side: `GET /api/b2/report` must check the entitlement —
   today it doesn't, and `Report.jsx` is reachable from the result screen.
4. Replace the note with the purchase flow; unlocked rows open `Report.jsx`.

## 12. Design system

- Tokens and vendored components: `client/src/ds/` (Skillcase Design
  System — do not edit there, edit upstream and re-copy).
- B2 styles: `client/src/screens/b2/b2.css`. Box system: card (white,
  12 px radius, 1 px border), panel (grey, no border), inset (8 px), pill.
- One deliberate gold button: Full Exam Papers "Start" and Test screen
  "Start test". Everything else uses the navy exam CTA.
- **Known CSS trap:** two `.b2-card` rules exist. Any new `.b2-card`
  container with several children must set its own `display`, or it
  inherits a flex row (commented in the CSS).

## 13. Analytics

None is implemented. Proposed events to support §2 metrics:
`test_started {version}`, `test_completed {version, score, measured}`,
`suggested_opened {paperId, skill, source: test_screen|skill_list}`,
`paper_completed {paperId, correct, scorable}`,
`premium_lock_tapped {surface}`.

## 14. Backlog (priority order)

| # | Item | Why |
|---|---|---|
| 1 | Wire onboarding → first test → home (GAP 1) | the intended test-first flow |
| 2 | Speaking recorder + scoring in test and papers (GAP 3) | Speaking tile's 66 papers and test item are unanswerable |
| 3 | Score writing in the test (GAP 4) | Writing bar reads "Not measured yet" |
| 4 | Practice mode for skill-list papers (GAP 2) | audio should replay in practice |
| 5 | Native-speaker review of all content + AI model answers | nothing is SME-reviewed |
| 6 | Premium entitlement + payments (§11) | monetisation |
| 7 | Analytics (§13) | measure the goals |
| 8 | German Jobs / German Classes tabs | currently inert |

## 15. Open questions for product

1. Should the first test be mandatory before Home, or skippable?
2. What exactly does Premium unlock, and at what price model?
3. After all 10 tests: recycle versions, or stop retesting?
4. Should Writing/Speaking scores (once built) count toward the overall %,
   or stay separate?
5. Should the Detailed report stay reachable for free right after a test?

## 16. Done checklist (this handover)

- [x] Home redesign (§6.1) · skill lists with one suggestion (§6.2) · full papers (§6.3)
- [x] Answers & explanations after every paper (§6.4)
- [x] Test screen, test-first (§6.5)
- [x] 10 comparable placement tests with answers (§9)
- [x] Guidance + expected answers for all writing/speaking tasks (unreviewed)
- [x] Full content export + database dump (`content/`)
- [ ] GAP 1–4, Premium, analytics, content review (§14)
