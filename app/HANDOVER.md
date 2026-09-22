# Skillcase B2 — developer handover

Everything needed to run, understand and continue the B2 app. Read this
first; the product decisions behind it are in `B2_PRACTICE_TEST_PRD.md`.

## 1. What's in this repo

```
app/
├── client/                 React 19 + Vite
│   ├── b2app/              B2 entry point (index.html, main.jsx) — its own dev server
│   ├── src/screens/b2/     every B2 screen (see §3)
│   ├── src/ds/             vendored Skillcase design-system tokens + components
│   ├── src/lib/b2api.js    the only file that talks to the API
│   └── public/b2/          images and audio served to the browser
├── server/                 Node + Express + Postgres
│   ├── src/routes/b2.js    every B2 API endpoint (/api/b2/*)
│   ├── src/b2/             B2 logic — scoring, assessment, suggestions, speech, TTS
│   ├── src/seed/           seed scripts + authored content (core2026b/v1…v10.js = the 10 tests)
│   ├── tools/              export, audit, audio generation, migrations
│   └── test/               node:test suite (892 tests)
├── content/                ALL learning content as JSON, one file per unit — see content/README.md
├── HANDOVER.md             this file
└── B2_PRACTICE_TEST_PRD.md product requirements for the practice/test loop
```

## 2. Run it locally

Needs Node 20+ and Postgres 14+.

```bash
# 1. database — schema + all content in two files, no seed scripts needed
createdb learn_german
psql learn_german -f content/_database/schema.sql
psql learn_german -f content/_database/b2_content_data.sql

# 2. API (port 4000)
cd server
cp .env.example .env        # fill in keys — see the comments in the file
npm install
npm start

# 3. B2 client (port 5181)
cd ../client
npm install
npm run dev:b2              # open http://localhost:5181
```

The client calls `http://localhost:4000/api` unless `VITE_API_URL` is set
(e.g. in `client/b2app/.env.development.local`). Sign up on the first screen;
every learner route requires a session.

**Which keys matter:** the app runs without any of them. Azure AI keys power
writing feedback; Azure Speech keys power listening audio generation and
pronunciation scoring. Without keys those features degrade honestly (no fake
scores) rather than break.

Tests: `cd server && npm test`.

## 3. Screen map

| Screen | File | Reached from |
|---|---|---|
| Home — navbar, mode tabs, test banner, 4 skill tiles, full-papers banner | `B2Home.jsx` | app start |
| Skill practice list (Reading/Listening/Writing/Speaking) + "Suggested" row | `B2Home.jsx` (track view) | Home tile |
| Test screen — next test, last scores, practise next, previous tests | `TestHub.jsx` | Home test banner |
| Taking the 15-min test | `Assessment.jsx` | Test screen / first-time banner |
| Result right after a test | `AssessmentResult.jsx` | end of a test |
| Detailed report (locked as Premium on the Test screen) | `Report.jsx` | AssessmentResult |
| Doing a practice or exam paper + answers & explanations | `ExamPaper.jsx` | any paper row |
| Full exam papers list | `B2Home.jsx` (showPapers view) | Home "Start" |
| Guided lessons | `B2Lesson.jsx` | "Themen" in a skill list |
| Interview practice | `Interview.jsx` | (not linked from Home yet) |

Routing is a single state machine in `B2App.jsx` (`screen` state,
persisted to sessionStorage so refresh keeps your place).

Styling: `screens/b2/b2.css`, built on design-system tokens from
`src/ds/*.css`. Two `.b2-card` rules exist (a legacy clickable row and the
newer box system) — any new `.b2-card` container with several children
must set its own `display`, or it inherits a flex row. This is commented in
the CSS.

## 4. Key data flows

- **Test (core-2026b):** 10 comparable versions, same blueprint
  (`server/src/seed/b2/core2026b/blueprint.js`). The server hands out the
  next unsat version (`assessment_store.currentDiagnosticVersion`). Scores:
  `GET /api/b2/assessment/progress` (latest + per-skill), history:
  `GET /api/b2/assessment/history`.
- **Suggested practice:** `GET /api/b2/practice/suggested` — one paper per
  skill, ranked by the learner's weakest capabilities (`server/src/b2/suggest.js`).
- **Practice & exam papers:** `GET /api/b2/practice/skill/:skill`,
  `GET /api/b2/paper/complete`, then `/api/b2/paper/:id/start` →
  answer → finish (returns answers + explanations).

## 5. What is placeholder / not built

These are deliberate and visible in the UI — don't mistake them for bugs:

1. **Premium / Locked** (detailed report, older reports): UI only. No
   payment provider or entitlement check exists; `Report.jsx` is still
   reachable after finishing a test.
2. **Writing & Speaking scores on the Test screen** show "Not measured
   yet". The test captures them but has no auto-grader wired in. The pieces
   exist: `server/src/b2/task_profiles.js` (deterministic writing checks) and
   `server/src/b2/speech.js` (Azure pronunciation scoring, used by
   `Interview.jsx`). The test screen has no mic recorder yet — port the one
   from `Interview.jsx`.
3. **Speaking practice papers** (96 under the Speaking tile) show "not
   recorded yet" — same missing recorder in `ExamPaper.jsx`.
4. **German Jobs / German Classes** tabs on Home are inert.
5. **Content review:** everything is structurally audited, nothing is
   native-speaker reviewed. Writing/speaking `expected_answer`s in
   `content/` are AI drafts, marked `AI_DRAFT_UNREVIEWED`.

## 6. Regenerating things

```bash
cd server
node tools/export_content_tree.js      # rebuild content/ from the database
node tools/generate_model_answers.js   # fill missing writing/speaking guidance + model answers
node tools/audit_b2_core_2026b.js      # the 10 tests must stay 0 FAIL
node tools/make_core2026b_audio.js     # synthesise test audio (needs Azure Speech)
node src/seed/seed_core2026b.js --force  # reload the 10 tests from src/seed/b2/core2026b/
```
