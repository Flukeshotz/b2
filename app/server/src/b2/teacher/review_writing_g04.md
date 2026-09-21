# Teacher review — Homeoffice writing task (`g04_homeoffice_thread`)

Six questions. Everything you need to answer them is below; you do not need to
look at any code.

**Status:** prototype. Nothing here has been reviewed by a teacher yet.

---

## 1. Are the four content-point detectors semantically correct?

The system decides whether a learner covered each Leitpunkt. It gets this right
about **three times in four** on German it has never seen. It is right about
**every** text it says is covered — it has never once claimed a point was
covered when it was not, across 84 test sentences.

| Leitpunkt | What it must recognise |
|---|---|
| Ihre eigene Position | the learner takes a side on the attendance rule |
| Eine Begründung | a reason **for that position**, not any reason |
| Bezug auf eine Person | engaging with a named position from the thread |
| Ein Beispiel | a concrete instance from the learner's own working life |

**What we need from you:** for each Leitpunkt, is that the right thing to be
looking for in a Goethe Forumsbeitrag? Particularly point 2 — we require the
reason to support the learner's own position, so "Meine Nachbarin arbeitet im
Homeoffice, weil ihr Kind klein ist" does **not** count. Is that the right call?

## 2. Are valid formulations systematically missed?

Five sentences we currently get wrong. All five are things a good B2 learner
might write, and we mark them as *not covered*:

1. „Mir leuchtet nicht ein, warum ausgerechnet ein fester Wochentag helfen soll."
2. „Zwei Bürotage pro Woche sind aus meiner Erfahrung reine Symbolpolitik."
3. „Ob man kommt, sollte man selbst entscheiden dürfen."
4. „Ich lehne sie ab; im Großraum komme ich schlicht zu nichts." *(the reason is
   there, with no causal word at all)*
5. „Da die Aufgaben ohnehin digital verteilt werden, spielt der Ort kaum eine
   Rolle." *(this one we flag as **unsure** rather than missing)*

**What we need from you:** are these representative of how your learners write,
or unusual? If a whole class of your learners writes like 1–4, the detector is
worse than the number suggests.

## 3. Are invalid formulations wrongly accepted?

Not once in testing. But the traps we built may be the wrong traps.

**What we need from you:** two or three sentences that *look* like they cover a
Leitpunkt and do not. Those are worth more to us than any number.

## 4. Is the selected weakness pedagogically useful?

The learner is told exactly one thing. Two real examples:

| Learner's text | We say |
|---|---|
| 40 short simple sentences, no connectors, only their opinion | *jeden Punkt abdecken, nach dem die Aufgabe fragt* — and name the three missing |
| A sound argument, engages with two posters, plain vocabulary | *zum genaueren Wort greifen* |

**What we need from you:** in each case, is that what you would have said first?

## 5. Is the micro-lesson the right intervention?

| Weakness | Where we send them |
|---|---|
| Missing Leitpunkte | no lesson — we name the missing points |
| Konnektoren | „Erst zugeben, dann widersprechen" (concessive moves) |
| Wortschatz | „Fünf Sätze, mit denen man widerspricht" (five argumentative phrases) |
| Satzbau / Konjunktiv II | „Was gewesen wäre" (unreal past) |

Three checks have **no** lesson — *Register*, *Wortwiederholung*, *feste
Nomen-Verb-Verbindungen*. We therefore never raise them, even when they are the
biggest problem in the text.

**What we need from you:** are these the right pairings? And is staying silent
about Register the right call, or should we say something even with nothing to
offer?

## 6. Does the rewrite show measurable improvement?

The learner rewrites their own text and we check the **one** feature we taught,
nothing else. A rewrite that got better everywhere except that feature is
reported as unchanged.

**What we need from you:** is that too strict? A learner whose whole text
improved may feel the verdict is unfair, even though the thing they were taught
did not move.

---

## The one thing we would change first

Content-point detection is pattern-based. It cannot see a reason given by
juxtaposition, and it cannot tell *a* reason from *the learner's* reason. Those
are meaning questions, and more patterns will not answer them. Your answers to
questions 1–3 decide whether that ceiling is acceptable for a first release.
