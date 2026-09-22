# B2 Practice & Test Loop — PRD

Date 2026-09-23 (updated). Covers the B2 home redesign, the Test screen, suggested
practice, and the core-2026b test bank expansion. Written after the work
landed, not before — this documents what was built and why, and what is
still open, for whoever picks this up next.

## 1. Problem

Before this pass, B2's home screen was a flat list of practice categories
with no sense of "where am I, and what should I do next." The diagnostic
assessment existed (`core-2026b`, see `B2_CORE_2026B.md`) but was buried
under "Take a quick test," three taps from Home, and nothing on Home ever
showed its result. A learner had no reason to retest, no way to see if she
was improving, and no steer toward the practice that would actually move
her score.

## 2. Goal

Make the loop the product is built around — **assess → practise weak areas
→ re-assess** — visible and one tap deep from Home, without turning Home
into a dashboard. Specifically:

1. Home always shows the latest test score and a way to retest.
2. Practising each skill (Reading/Listening/Writing/Speaking) surfaces
   papers targeted at the learner's actual weak capabilities, not a flat
   list.
3. A dedicated Test screen holds everything about her test history —
   without dumping a full breakdown onto Home.
4. The test bank has enough distinct, comparable versions that retesting
   doesn't mean sitting the same paper twice.

## 3. Non-goals

- **No real payment processing.** "Detailed report" and older-test unlocks
  are labelled `Premium`/`Locked` and explain honestly that no purchase
  flow exists yet — this app has no payment provider wired in, and none is
  faked. See §7.
- **No Goethe/telc-equivalent score, no CEFR claim, no pass probability.**
  Same restriction `core-2026b`'s blueprint has always carried
  (`forbiddenClaims` in `blueprint.js`) — nothing here loosens it.
- **No Jobs/German Classes surfaces.** The mode row under Home's navbar
  names them (matching the reference mocks) but they are inert; B2 has no
  screens behind them yet.
- **No bottom tab bar, no coins/streak chrome.** B2 carries none of A1's
  reward economy (see `screens/b2/b2.css`'s box-system note and
  `B2Cta.jsx`), and this pass doesn't add it.

## 4. Users

Same as the rest of B2: adult German learners, mostly nurses working
toward Anerkennung, studying in short sessions around shifts. Design
decisions inherited from that context (see `project_real_hiring_bar_evidence`
and `project_b2_nurse_wedge` in product memory) — no change here.

## 5. The loop, screen by screen

### 5.1 Home (`B2Home.jsx`)

Top to bottom:

1. **Navbar** — `B2 German Level` / `Goethe & telc exam prep`, a `Free Plan`
   pill (honest state — never claims Premium), and a generic avatar. No A1
   switcher button (removed on request).
2. **Mode row** — `Job Preparation` (active, real) / `German Jobs` /
   `German Classes` (both inert, named to match the reference UI but not
   wired to anything).
3. **Test banner** — Maya photo, bold title, grey subtitle, chevron. Never
   tested: *"Take a test to check where you stand."* Has a result:
   *"Your last test: 25%"* + *"See your score and take the next one"*.
   Tapping opens the Test screen. **No score breakdown lives on Home.**
4. **Practice grid** — 2×2, one tile per skill (Reading/Listening/Writing/
   Speaking), each showing its exercise count. Deliberately 2×2, not the
   design system's default 3-up `PracticeTile` grid — B2 has exactly four
   skills.
5. **Full Exam Papers** — its own section below the grid, never merged into
   it: a paper is a complete timed sitting across every module, a
   different kind of thing from a single-skill drill. Navy banner, Maya
   illustration, and the one deliberate gold button in B2 (`Start` — see
   `.b2-papers-banner-start` in `b2.css` for why gold is scoped to just
   this one control).

### 5.2 Test screen (`TestHub.jsx`)

Reached from Home's test banner. Test-first, top to bottom:

1. **Take your next test** — "Test N of 10", 15 min, Start button. The
   primary action. Hidden once all 10 are sat (no "you've sat every
   version" text).
2. **Your last test** — basic scores: overall %, one bar per taught skill
   (Reading, Listening, Writing, Speaking) and a one-line plain-English
   summary. Writing and Speaking read "Not measured yet" — the test does
   not auto-grade them (see §9). Below it, the **Detailed report** row is
   locked (Premium).
3. **Practise next** — up to three papers from `b2/suggest.js`, one per
   weak skill, weakest first. Opening one and pressing Back returns here.
4. **Previous tests** — each earlier sitting shows its basic score; its
   detailed report is locked.

No bottom Done button — Back is in the top bar.

### 5.3 Detailed report (`Report.jsx`)

Unchanged in purpose, redesigned to match the reference (large ring, a bar
per skill, `What went well` / `Try to improve` cards built from the real
best/worst measured dimensions — no invented sub-metrics). Two entry
points, both legitimate and left alone:

- **Immediately after finishing an assessment**, from `AssessmentResult.jsx`
  — a fresh reward, not a revisit.
- **Via the locked card on the Test screen**, once unlocking exists.

### 5.4 Suggested practice (`PracticeHome` skill drilldowns)

Each skill's practice list now opens with a "Suggested for you" card:
papers ranked by how much of their content targets the learner's weakest
capabilities from her last test (`b2/suggest.js`, `/practice/suggested`).
Falls back to nothing shown if she hasn't tested yet — no recommendation
is invented from zero evidence.

## 6. Data model — nothing new

Every number on every one of these screens reads from the same two places
`core-2026b` already had:

- `assessment_store.progress(userId)` — `.latest`, `.delta`, per-skill and
  per-capability breakdowns for the most recent comparable pair.
- `assessment_store.history(userId)` — every attempt, newest first, with
  its own score.

No second scoring model was introduced. `b2/suggest.js` is the one new
server module, and it only *ranks* existing practice papers against
existing weakness data — it doesn't score anything itself.

## 7. The "Premium" gate — what it actually is

The detailed item-by-item report is labelled `Premium`/locked on the Test
screen — for the latest sitting and for each previous one (previous
sittings still show their basic score). Tapping either reveals one sentence: *"A
deeper, item-by-item report is planned but not yet available to buy — this
screen doesn't process payments."*

This is a deliberate placeholder, not a shipped paywall. **There is no
payment provider integrated anywhere in this codebase.** Before this can
become a real paywall, someone needs to:

1. Pick a payment provider and decide what "Premium" actually includes
   (just the older-sitting unlock? the item-level report? both?).
2. Decide whether "Premium" is a per-report purchase or a subscription —
   the UI currently implies a subscription-shaped feature name but only
   ever shows one locked report at a time.
3. Wire real entitlement checks server-side — right now `Report.jsx` is
   still fully reachable by URL/screen-state for anyone who's finished an
   assessment; the lock is a Test-screen-level UI convention, not a
   route-level restriction.

## 8. The test bank — done

Ten comparable `core-2026b` versions, all seeded, all with synthesised
listening audio, all audited clean (`tools/audit_b2_core_2026b.js`: 0 FAIL,
0 WARN; identical slot/skill/capability/difficulty structure; 34.8%
knowledge / 65.2% skill; zero duplicated items, options or passages). All
200 auto-marked items resolve and grade correctly.

| Version | Theme |
|---|---|
| v1 | Besprechungen und Protokoll |
| v2 | Technik im Büro |
| v3 | Teamtage und Zusammenarbeit |
| v4 | Kundenreklamation und Kulanz |
| v5 | Homeoffice-Regelung |
| v6 | Schichttausch und Dienstplan |
| v7 | Weiterbildungsbudget |
| v8 | Bürowechsel und Umzug |
| v9 | Mitarbeitergespräch und Zielvereinbarung |
| v10 | Dienstreise und Spesenabrechnung |

Every objective item has its answer key and a German explanation. Every
writing/speaking task has `guidance` and an `expected_answer` (AI-drafted,
unreviewed) in `content/`.

## 9. Known gaps / explicitly out of scope this pass

- **Content accuracy.** Every check in this pass confirms structure
  (comparable slots, correct answer keys, no fabricated scores). None of
  it confirms the German itself is idiomatic or error-free — that needs a
  native-speaker or SME review pass, same gap every `B2_*_AUDIT.md` in
  this repo already flags for `core-2026b`.
- **Screen-reader labels** on answer-option buttons are still missing
  (noted in an earlier audit this session, not fixed).
- **No real entitlement system** — see §7.
- **Jobs/German Classes** are visual only.

## 10. What "done" looks like

- Home shows score + retest, never a breakdown. ✅ shipped.
- Test screen: score, per-skill bars, one-line verdict, locked history,
  locked detailed report. ✅ shipped.
- Suggested practice per skill. ✅ shipped.
- Ten comparable test versions. ✅ shipped (v1–v10).
- Real payment/entitlement. ❌ not started, scoped in §7.
