/**
 * THE ASSESSMENT REGISTRY — every version, every item, one shape.
 *
 * This is what a future backend asks. Two questions have to be cheap:
 *
 *   "Give me three unused items testing `argue` at about this difficulty."
 *        → itemsFor({ capability: "argue", excludeIds: alreadySeen, limit: 3 })
 *   "Give me a V2 assessment with the same blueprint as V1."
 *        → version("v2")   ... and compare(version("v1"), version("v2"))
 *
 * V1 IS NOT COPIED HERE. It is read from ../screening.js and ANNOTATED — slot
 * ids, provenance and review status are attached at load time. Copying the items
 * would create a second source of truth that drifts from the one the live
 * `/api/b2/screening` route actually serves, and the whole point of an
 * assessment bank is that the thing you audit is the thing the learner sits.
 * screening.js is unmodified.
 *
 * NO SELECTOR LIVES HERE. Composing a weakness-targeted retest is Phase 3B.
 * This file only makes the pool queryable.
 */

const { SCREENING } = require("../screening");
const { V2 } = require("./items_v2");
const { V3 } = require("./items_v3");
const { BLUEPRINT, SLOTS, SPEAKING_SLOT } = require("./blueprint");

/* ── V1 ANNOTATION ───────────────────────────────────────────────────────────
   screening.js predates the blueprint, so its items carry no slot. The mapping
   is mechanical — V1's order IS the slot order, which is why the blueprint could
   be derived from it in the first place. Asserted at load time below, so that
   editing screening.js without editing this map fails loudly instead of
   silently mis-slotting an item. */
const V1_SLOTS = {
  g1: "G1", g2: "G2", g3: "G3", g4: "G4", g5: "G5", g6: "G6", g7: "G7", g8: "G8",
  v1: "V1", v2: "V2", v3: "V3", v4: "V4", v5: "V5", v6: "V6",
  r1: "R1", r2: "R2", r3: "R3",
  l1: "L1", l2: "L2",
};

/* V1's speaking prompt. It is NOT in screening.js and is not injected into it:
   the deployed `screen_v1` has no speaking section, and every learner who has
   already sat V1 sat it without one.

   Recorded here so all three versions have a speaking prompt available, and
   flagged `wiredIntoV1: false` so nobody reads this as "V1 assesses speaking".
   Wiring it in is a Phase 3B decision with a real consequence: it changes what
   `screen_v1` means, and past attempts would need marking as the earlier form. */
const V1_SPEAKING = {
  slot: "S1", id: "v1_s1", minutes: 2, minSeconds: 60, maxSeconds: 90,
  instruction: "Sprechen Sie etwa eine Minute. Sie hören sich danach selbst.",
  prompt: "Manche Betriebe schaffen feste Arbeitszeiten ab und lassen die Teams selbst planen. Welche Lösung halten Sie für sinnvoller — feste Zeiten oder freie Planung? Begründen Sie Ihre Meinung und gehen Sie kurz auf die Nachteile der anderen Möglichkeit ein.",
  elicits: ["argue", "justify", "concede"],
  expectedAnswer: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  scoring: "transcript_only",
  wiredIntoV1: false,
};

/* ── PROVENANCE ──────────────────────────────────────────────────────────────
   Per version, materialised onto every item by `normalise` so that an item
   pulled out of the pool on its own still carries where it came from. Section
   15's requirement is that the fact travels with the item, not that the string
   is typed forty times.

   NOTHING here is sourced from Goethe or telc, and nothing may be labelled as
   such. V1's listening is the one honest blemish and it is recorded, not hidden. */
const PROVENANCE = {
  v1: {
    source: "Skillcase, authored", sourceType: "original", status: "authored",
    note: "Grammar, vocabulary, reading and writing authored for Skillcase. Listening reuses src_muede s3.",
    audio: "Azure TTS from Skillcase scripts",
  },
  v2: {
    source: "Skillcase, authored", sourceType: "original", status: "authored",
    note: "All items original. Listening dialogue written for this bank; audio synthesised by Azure TTS.",
    audio: "Azure TTS from the turns in items_v2.js",
  },
  v3: {
    source: "Skillcase, authored", sourceType: "original", status: "authored",
    note: "All items original. Listening dialogue written for this bank; audio synthesised by Azure TTS.",
    audio: "Azure TTS from the turns in items_v3.js",
  },
};

/* ── REVIEW ──────────────────────────────────────────────────────────────────
   `draft` everywhere, because no teacher or SME has read any of it — including
   V1, which has been in front of learners without a recorded review. Marking
   anything `reviewed` requires an actual recorded review; there is no code path
   here that sets it, deliberately. */
const REVIEW = {
  v1: { status: "draft", reviewer: null, reviewedAt: null,
        note: "In production use since before this phase. No recorded teacher review exists." },
  v2: { status: "draft", reviewer: null, reviewedAt: null, note: "Authored in Phase 3A. Unreviewed." },
  v3: { status: "draft", reviewer: null, reviewedAt: null, note: "Authored in Phase 3A. Unreviewed." },
};

/* Which practice content an assessment section borrows, if any. The empty
   string is not good enough — the audit needs to distinguish "checked, clean"
   from "never looked at". */
const PRACTICE_SOURCE = {
  v1: { listening: { sourceId: "src_muede", sectionId: "s3", practiceTopic: "b2_muede_listen" } },
  v2: { listening: null },
  v3: { listening: null },
};

const FORMAT_FOR = { grammar: "mc2", vocabulary: "gap3", reading: "mc3", listening: "mc3" };

const bySlot = Object.fromEntries(SLOTS.map(s => [s.slot, s]));

/** One item, in the shape everything downstream consumes. */
function normalise(raw, { version, skill, slot }) {
  const spec = bySlot[slot] || (slot === "S1" ? SPEAKING_SLOT : null);
  return {
    id: raw.id,
    slot,
    version,
    skill,
    capability: raw.capability ?? spec?.capability ?? null,
    check_id: raw.check_id ?? spec?.check_id ?? null,
    format: spec?.format ?? FORMAT_FOR[skill] ?? null,
    kind: raw.kind ?? spec?.kind ?? null,
    // Difficulty is stated as the blueprint tier plus the section's difficulty
    // FEATURES. A per-item number would be an estimate we have no data for.
    tier: BLUEPRINT.difficulty.tier,
    // Objectively scored, or judged. This is what tells a future scorer whether
    // `correct` is even a meaningful column for this row.
    scoring: raw.scoring
      ?? (skill === "writing" ? "analyser" : skill === "speaking" ? "transcript_only" : "key"),
    objective: !["writing", "speaking"].includes(skill),
    // Does it feed the comparable core? Speaking never does.
    comparable: skill !== "speaking",
    banded: skill !== "speaking",
    evidenceType: skill === "speaking" ? "unbanded_signal" : "scored_evidence",
    // Present in the version a learner actually sits. Overridden to false for
    // the V1 speaking prompt, which exists in the pool but not in screen_v1.
    wired: true,
    provenance: PROVENANCE[version],
    review: REVIEW[version],
    // Carried through untouched so nothing about the item's content is lost.
    content: raw,
  };
}

function itemsOfVersion(v) {
  const out = [];
  for (const sec of v.sections) {
    if (sec.key === "writing") {
      out.push(normalise({ ...sec, id: sec.id, capability: "argue", scoring: "analyser" },
        { version: v.version, skill: "writing", slot: "W1" }));
      continue;
    }
    if (sec.key === "speaking") {
      out.push(normalise({ ...sec, id: sec.id, capability: "argue" },
        { version: v.version, skill: "speaking", slot: "S1" }));
      continue;
    }
    for (const it of sec.items || []) {
      const slot = it.slot || V1_SLOTS[it.id];
      out.push(normalise(it, { version: v.version, skill: sec.key, slot }));
    }
  }
  return out;
}

/* V1, rebuilt from the live screening rather than copied. The writing section
   gets an id it does not carry in screening.js; everything else is untouched. */
const V1 = {
  id: SCREENING.id,
  version: "v1",
  totalMinutes: SCREENING.totalMinutes,
  theme: "Arbeitszeit und Vier-Tage-Woche",
  sections: SCREENING.sections.map(s =>
    s.key === "writing" ? { ...s, id: "v1_w1", slot: "W1" } : s),
  speakingAvailable: V1_SPEAKING,
};

const VERSIONS = { v1: V1, v2: V2, v3: V3 };

/* V1's speaking prompt joins the POOL even though it is not wired into the
   deployed screen_v1. It is a real, authored, selectable item — leaving it out
   would report slot S1 as having only two variants, which is false about the
   content and would push someone into authoring a third that already exists.
   `wired: false` keeps the distinction that matters: available to a selector,
   not part of what V1 currently asks a learner to do. */
const ITEMS = [
  ...Object.values(VERSIONS).flatMap(itemsOfVersion),
  { ...normalise({ ...V1_SPEAKING, capability: "argue" },
      { version: "v1", skill: "speaking", slot: "S1" }), wired: false },
];

/* Load-time integrity. A mis-slotted item silently destroys comparability, and
   the failure would only surface as a wrong delta months later — so it fails
   here, at require time, where it is cheap. */
for (const it of ITEMS) {
  if (!it.slot) throw new Error(`assessment item ${it.id} has no slot`);
  const spec = bySlot[it.slot] || (it.slot === "S1" ? SPEAKING_SLOT : null);
  if (!spec) throw new Error(`assessment item ${it.id} names unknown slot ${it.slot}`);
  if (spec.capability && it.capability !== spec.capability) {
    throw new Error(`${it.id}: slot ${it.slot} expects capability ${spec.capability}, item says ${it.capability}`);
  }
  if (spec.check_id !== undefined && it.check_id !== spec.check_id) {
    throw new Error(`${it.id}: slot ${it.slot} expects check_id ${spec.check_id}, item says ${it.check_id}`);
  }
}

/* ── QUERIES ─────────────────────────────────────────────────────────────────
   Deliberately dumb filters. The retest SELECTOR — weakness targeting, the
   65/35 mix, fallback when a capability runs dry — is Phase 3B and is not
   implemented here. */

/** Every item, optionally narrowed. This is the "three unused `argue` items" call. */
function itemsFor({ capability, skill, checkId, slot, version, excludeVersions = [],
                    excludeIds = [], objectiveOnly = false, limit = null } = {}) {
  const seen = new Set(excludeIds);
  let out = ITEMS.filter(i =>
    (!capability || i.capability === capability) &&
    (!skill || i.skill === skill) &&
    (!checkId || i.check_id === checkId) &&
    (!slot || i.slot === slot) &&
    (!version || i.version === version) &&
    !excludeVersions.includes(i.version) &&
    !seen.has(i.id) &&
    (!objectiveOnly || i.objective));
  if (limit != null) out = out.slice(0, limit);
  return out;
}

/* SECTION CONTEXT — the passage an item is about, and the audio it is about.
   A reading item is three options and a question; without its text it is
   unanswerable, and an item pulled out of the pool on its own has no way back
   to the section it came from. This is that way back.

   Audio naming differs by version and is not normalised here on purpose: V1
   points at a practice source (`src_muede` s3) that already has a file on disk,
   and rewriting that reference would be the silent V1 edit this phase forbids.
   V2 and V3 name their own `audioId`. The caller is told which file to expect,
   and whether it exists is the caller's question, not this file's. */
function sectionContext(version, skill) {
  const v = VERSIONS[version];
  if (!v) return null;
  const sec = v.sections.find(s => s.key === skill);
  if (!sec) return null;
  if (skill === "reading") return { title: sec.title, text: sec.text, instruction: sec.instruction };
  if (skill === "listening") {
    return {
      instruction: sec.instruction,
      situation: sec.situation ?? null,
      plays: sec.plays ?? 1,
      // V1: "src_muede_s3". V2/V3: their own authored id.
      audioFile: sec.sourceId ? `${sec.sourceId}_${sec.sectionId}` : sec.audioId,
      authored: !!sec.turns,
    };
  }
  if (skill === "writing") {
    return { prompt: sec.prompt, guidance: sec.guidance, minWords: sec.minWords };
  }
  if (skill === "speaking") {
    return { prompt: sec.prompt, instruction: sec.instruction,
             minSeconds: sec.minSeconds, maxSeconds: sec.maxSeconds };
  }
  return { instruction: sec.instruction, note: sec.note ?? null };
}

const version = (v) => VERSIONS[v] || null;
const itemsOf = (v) => ITEMS.filter(i => i.version === v);

/** How many distinct versions can fill this slot. The pool-depth question. */
function variantsPerSlot() {
  const out = {};
  for (const s of [...SLOTS, SPEAKING_SLOT]) {
    out[s.slot] = ITEMS.filter(i => i.slot === s.slot).map(i => i.id);
  }
  return out;
}

/** Structural comparison of two versions. Returns differences, never a verdict
    about difficulty — see BLUEPRINT.forbiddenClaims. */
function compare(a, b) {
  const A = itemsOf(a).filter(i => i.comparable);
  const B = itemsOf(b).filter(i => i.comparable);
  const tally = (list, key) => list.reduce((acc, i) => {
    const k = i[key]; if (k == null) return acc;
    acc[k] = (acc[k] || 0) + 1; return acc;
  }, {});
  const diff = (x, y) => {
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    const d = {};
    for (const k of keys) if ((x[k] || 0) !== (y[k] || 0)) d[k] = { [a]: x[k] || 0, [b]: y[k] || 0 };
    return d;
  };
  const overlap = A.filter(i => B.some(j => j.id === i.id)).map(i => i.id);
  return {
    a, b,
    itemCount: { [a]: A.length, [b]: B.length },
    skill: diff(tally(A, "skill"), tally(B, "skill")),
    capability: diff(tally(A, "capability"), tally(B, "capability")),
    check_id: diff(tally(A, "check_id"), tally(B, "check_id")),
    format: diff(tally(A, "format"), tally(B, "format")),
    sharedItemIds: overlap,
    structurallyComparable:
      A.length === B.length &&
      !Object.keys(diff(tally(A, "skill"), tally(B, "skill"))).length &&
      !Object.keys(diff(tally(A, "capability"), tally(B, "capability"))).length &&
      !Object.keys(diff(tally(A, "check_id"), tally(B, "check_id"))).length &&
      !Object.keys(diff(tally(A, "format"), tally(B, "format"))).length &&
      overlap.length === 0,
    // The claim we are entitled to make, carried with the result so a caller
    // cannot accidentally upgrade it.
    claim: "Comparable assessment structure",
  };
}

module.exports = {
  BLUEPRINT, VERSIONS, ITEMS, PROVENANCE, REVIEW, PRACTICE_SOURCE, V1_SPEAKING,
  version, itemsOf, itemsFor, variantsPerSlot, compare, sectionContext,
};
