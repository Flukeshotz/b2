#!/usr/bin/env node
/**
 * DETERMINISTIC AUDIT of the B2 assessment banks.
 *
 *   node tools/audit_b2_assessment.js          human-readable
 *   node tools/audit_b2_assessment.js --json   machine-readable
 *
 * Needs no database, no API and no network — it reads the content files and
 * computes. That is deliberate: the content has to be provable in an
 * environment where Postgres is unreachable, which is the environment we are in.
 *
 * It answers six questions, and it is allowed to FAIL. Exit code 1 means a real
 * defect — a repeated item, a broken key, a practice overlap — not a warning.
 * Gaps that are known and accepted (V1's listening) are reported as findings
 * without failing, because failing on a fact we cannot change from here would
 * make the exit code meaningless.
 */

const assess = require("../src/seed/b2/assessment");
const { BLUEPRINT, ITEMS, VERSIONS, PRACTICE_SOURCE, REVIEW } = assess;

const JSON_OUT = process.argv.includes("--json");
const VERSION_IDS = Object.keys(VERSIONS);

/* Normalised for comparison: case, punctuation spacing and line breaks must not
   let the same sentence hide from the duplicate check behind a typographic
   difference. */
const norm = (s) => String(s || "")
  .toLowerCase()
  .replace(/[“”„"'’‚`]/g, "")
  .replace(/[\s ]+/g, " ")
  .replace(/[—–-]/g, "-")
  .trim();

const tally = (list, key) => list.reduce((a, i) => {
  const k = typeof key === "function" ? key(i) : i[key];
  if (k == null) return a;
  a[k] = (a[k] || 0) + 1; return a;
}, {});

const findings = [];
const fail = (code, msg, detail) => findings.push({ level: "FAIL", code, msg, detail });
const warn = (code, msg, detail) => findings.push({ level: "WARN", code, msg, detail });
const note = (code, msg, detail) => findings.push({ level: "NOTE", code, msg, detail });

/* ── 1. COVERAGE ─────────────────────────────────────────────────────────── */
const coverage = {
  itemsPerVersion: Object.fromEntries(VERSION_IDS.map(v => [v, assess.itemsOf(v).length])),
  comparablePerVersion: Object.fromEntries(
    VERSION_IDS.map(v => [v, assess.itemsOf(v).filter(i => i.comparable).length])),
  perSkill: Object.fromEntries(VERSION_IDS.map(v => [v, tally(assess.itemsOf(v), "skill")])),
  perCapability: Object.fromEntries(VERSION_IDS.map(v => [v, tally(assess.itemsOf(v), "capability")])),
  perFormat: Object.fromEntries(VERSION_IDS.map(v => [v, tally(assess.itemsOf(v), "format")])),
  perCheckId: Object.fromEntries(VERSION_IDS.map(v => [v, tally(assess.itemsOf(v), "check_id")])),
};

/* ── 2. KEYS AND ANSWERABILITY ───────────────────────────────────────────────
   An item whose key points outside its options is unanswerable, and it would
   silently mark every learner wrong. Cheap to check, catastrophic to miss. */
for (const it of ITEMS) {
  if (!it.objective) continue;
  const c = it.content;
  const opts = c.options || [];
  if (!Array.isArray(opts) || opts.length < 2) {
    fail("BAD_OPTIONS", `${it.id} has ${opts.length} option(s)`, it.id);
    continue;
  }
  if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer >= opts.length) {
    fail("BAD_KEY", `${it.id} key ${c.answer} is outside its ${opts.length} options`, it.id);
  }
  if (new Set(opts.map(norm)).size !== opts.length) {
    fail("DUPLICATE_OPTION", `${it.id} repeats an option`, it.id);
  }
  if (!c.why) warn("NO_RATIONALE", `${it.id} has no explanation`, it.id);
}

/* Answer-position balance. If the key sits in the same slot every time a
   learner can score by pattern, not by German. Reported per version rather
   than enforced — with 8 two-option items a perfect split is not always
   possible and forcing one would be worse than reporting it. */
const keyBalance = {};
for (const v of VERSION_IDS) {
  const objective = assess.itemsOf(v).filter(i => i.objective);
  keyBalance[v] = tally(objective, i => `answer_${i.content.answer}`);
  const two = objective.filter(i => (i.content.options || []).length === 2);
  const firsts = two.filter(i => i.content.answer === 0).length;
  if (two.length && (firsts === 0 || firsts === two.length)) {
    warn("KEY_POSITION", `${v}: every two-option key is in position ${firsts ? 0 : 1}`, v);
  }
}

/* ── 3. DUPLICATION ACROSS VERSIONS ──────────────────────────────────────────
   The core promise of this phase. A retest that repeats an item measures
   memory. Checked on CONTENT, not ids — different ids carrying the same German
   is exactly the failure that would slip through a review. */
const dup = { itemIds: [], stems: [], optionSets: [], passages: [], transcripts: [], prompts: [] };

const seenIds = new Map();
for (const it of ITEMS) {
  if (seenIds.has(it.id)) dup.itemIds.push(it.id);
  seenIds.set(it.id, it);
}
if (dup.itemIds.length) fail("DUPLICATE_ITEM_ID", `${dup.itemIds.length} repeated item id(s)`, dup.itemIds);

const stemOf = (it) => {
  const c = it.content;
  return norm(c.q || c.sentence || c.context || c.prompt || "");
};
const byStem = new Map();
for (const it of ITEMS) {
  const s = stemOf(it);
  if (!s) continue;
  (byStem.get(s) || byStem.set(s, []).get(s)).push(it);
}
for (const [s, list] of byStem) {
  if (list.length > 1 && new Set(list.map(i => i.version)).size > 1) {
    dup.stems.push({ stem: s.slice(0, 60), items: list.map(i => i.id) });
  }
}
if (dup.stems.length) fail("DUPLICATE_STEM", `${dup.stems.length} stem(s) repeat across versions`, dup.stems);

const byOptions = new Map();
for (const it of ITEMS) {
  const opts = it.content.options;
  if (!Array.isArray(opts)) continue;
  const k = opts.map(norm).sort().join(" | ");
  (byOptions.get(k) || byOptions.set(k, []).get(k)).push(it);
}
for (const [, list] of byOptions) {
  if (list.length > 1 && new Set(list.map(i => i.version)).size > 1) {
    dup.optionSets.push(list.map(i => i.id));
  }
}
if (dup.optionSets.length) fail("DUPLICATE_OPTIONS", `${dup.optionSets.length} option set(s) repeat across versions`, dup.optionSets);

/* Passages, transcripts and prompts live on the section, not the item. */
const sectionsOf = (v) => VERSIONS[v].sections;
const passages = {}, transcripts = {}, prompts = {}, speakingPrompts = {};
for (const v of VERSION_IDS) {
  for (const sec of sectionsOf(v)) {
    if (sec.key === "reading" && sec.text) passages[v] = norm(sec.text);
    if (sec.key === "listening") {
      transcripts[v] = sec.turns ? norm(sec.turns.map(t => t.text || t.de).join(" "))
                                 : `EXTERNAL:${sec.sourceId}:${sec.sectionId}`;
    }
    if (sec.key === "writing" && sec.prompt) prompts[v] = norm(sec.prompt);
  }
}
/* Speaking prompts come from the POOL, not the sections — V1's exists without
   being wired into a section, and it still must not duplicate V2's or V3's. */
for (const it of ITEMS.filter(i => i.skill === "speaking")) {
  if (it.content.prompt) speakingPrompts[it.version] = norm(it.content.prompt);
}
const repeats = (map, label, bucket) => {
  const seen = new Map();
  for (const [v, val] of Object.entries(map)) {
    if (seen.has(val)) { bucket.push({ label, versions: [seen.get(val), v] });
      fail("DUPLICATE_" + label.toUpperCase(), `${label} identical in ${seen.get(val)} and ${v}`, [seen.get(val), v]); }
    seen.set(val, v);
  }
};
repeats(passages, "passage", dup.passages);
repeats(transcripts, "transcript", dup.transcripts);
repeats(prompts, "prompt", dup.prompts);
repeats(speakingPrompts, "speaking_prompt", dup.prompts);

/* ── 4. PRACTICE OVERLAP ─────────────────────────────────────────────────────
   Two ways an assessment can borrow from practice: by DECLARING a practice
   source (V1's listening), or by accidentally containing the same sentences.
   Both are checked; the second needs the practice corpus. */
const practiceCorpus = [];
const loadPractice = () => {
  const tryLoad = (p, pick) => {
    try { const m = require(p); const t = pick(m); if (t) practiceCorpus.push(norm(t)); }
    catch (e) { note("PRACTICE_LOAD", `could not read ${p}: ${e.message}`, p); }
  };
  tryLoad("../src/seed/b2/src_muede", m => m.TRANSCRIPT || m.SCRIPT);
  tryLoad("../src/seed/b2/src_homeoffice", m => m.TRANSCRIPT || m.SCRIPT);
  tryLoad("../src/seed/b2/chunks_muede", m => JSON.stringify(m.CHUNKS || m));
  tryLoad("../src/seed/b2/chunks_homeoffice", m => JSON.stringify(m.CHUNKS || m));
  tryLoad("../src/seed/b2/exam/hoeren_t1_alltag",
    m => (m.TEXTS || []).flatMap(t => (t.turns || []).map(x => x.de || x.text)).join(" "));
  for (const s of ["homeoffice", "schichttausch", "unerwartet", "vorschlag"]) {
    tryLoad(`../src/seed/b2/maya/${s}`, m => JSON.stringify(m));
  }
};
loadPractice();

const practiceBlob = practiceCorpus.join("  ");
const overlap = { declared: [], textual: [] };

for (const v of VERSION_IDS) {
  const declared = PRACTICE_SOURCE[v] || {};
  for (const [skill, src] of Object.entries(declared)) {
    if (src) {
      overlap.declared.push({ version: v, skill, ...src });
      note("PRACTICE_OVERLAP_DECLARED",
        `${v} ${skill} reuses practice content (${src.sourceId}/${src.sectionId} = ${src.practiceTopic})`,
        { version: v, skill, ...src });
    }
  }
}

/* Sentence-level containment. Any assessment sentence of real length that also
   appears verbatim in practice material is an overlap the declaration missed. */
const sentencesOf = (t) => norm(t).split(/(?<=[.!?])\s+/).filter(s => s.split(" ").length >= 7);
for (const v of VERSION_IDS) {
  const own = [];
  for (const sec of sectionsOf(v)) {
    if (sec.text) own.push(...sentencesOf(sec.text));
    if (sec.turns) own.push(...sec.turns.flatMap(t => sentencesOf(t.text || t.de || "")));
  }
  for (const s of own) {
    if (practiceBlob.includes(s)) {
      overlap.textual.push({ version: v, sentence: s.slice(0, 70) });
    }
  }
}
if (overlap.textual.length) {
  fail("PRACTICE_OVERLAP_TEXT",
    `${overlap.textual.length} assessment sentence(s) appear verbatim in practice content`,
    overlap.textual);
}

/* ── 5. BLUEPRINT COMPARISON ─────────────────────────────────────────────── */
const comparisons = [];
for (let i = 0; i < VERSION_IDS.length; i++) {
  for (let j = i + 1; j < VERSION_IDS.length; j++) {
    const c = assess.compare(VERSION_IDS[i], VERSION_IDS[j]);
    comparisons.push(c);
    if (!c.structurallyComparable) {
      fail("NOT_COMPARABLE", `${c.a} and ${c.b} do not share a blueprint`, c);
    }
  }
}

/* Response burden: does each version land inside the time target? */
const burden = {};
for (const v of VERSION_IDS) {
  const mins = sectionsOf(v).reduce((a, s) => a + (s.minutes || 0), 0);
  burden[v] = {
    minutes: Math.round(mins * 10) / 10,
    objectiveItems: assess.itemsOf(v).filter(i => i.objective).length,
    freeProduction: assess.itemsOf(v).filter(i => !i.objective).length,
  };
  const { targetMinutes, toleranceMinutes } = BLUEPRINT.time;
  if (Math.abs(mins - targetMinutes) > toleranceMinutes) {
    warn("TIME_BUDGET",
      `${v} is ${burden[v].minutes} min against a ${targetMinutes}±${toleranceMinutes} target`, v);
  }
}

/* ── 6. POOL DEPTH — the retest question ─────────────────────────────────────
   Section 10 wants at least 3 variants per slot, and section 9 wants a retest
   that can be ~65% targeted at one capability. Both are pool-depth questions
   and both are reported honestly, gaps included. */
const variants = assess.variantsPerSlot();
const thinSlots = Object.entries(variants).filter(([, ids]) => ids.length < 3);
for (const [slot, ids] of thinSlots) {
  warn("THIN_SLOT", `slot ${slot} has ${ids.length} variant(s), target is 3`, { slot, ids });
}

const capDepth = {};
for (const cap of new Set(ITEMS.map(i => i.capability).filter(Boolean))) {
  const all = assess.itemsFor({ capability: cap });
  capDepth[cap] = {
    total: all.length,
    perVersion: tally(all, "version"),
    // Can a retest target this capability without reusing the version the
    // learner just sat? That is the question the selector will ask.
    unusedIfSat: Object.fromEntries(VERSION_IDS.map(v =>
      [v, assess.itemsFor({ capability: cap, excludeVersions: [v] }).length])),
  };
  if (all.length < 3) {
    warn("THIN_CAPABILITY", `capability "${cap}" has only ${all.length} item(s) across all versions`, cap);
  }
}

/* Can the 65/35 mix actually be built? Targeted slots must be fillable from
   capabilities the learner is weak in, without repeating the sat version. */
const { targeted, minBroadSlots } = BLUEPRINT.retestMix;
const coreSlots = BLUEPRINT.slots.length;
const targetedSlots = Math.round(coreSlots * targeted);
const mixFeasibility = {};
for (const cap of Object.keys(capDepth)) {
  const available = Math.min(...VERSION_IDS.map(v =>
    assess.itemsFor({ capability: cap, excludeVersions: [v] }).length));
  mixFeasibility[cap] = {
    targetedSlotsNeeded: targetedSlots,
    availableExcludingSatVersion: available,
    feasibleAlone: available >= targetedSlots,
  };
}
const noCapAlone = Object.values(mixFeasibility).every(m => !m.feasibleAlone);
if (noCapAlone) {
  note("MIX_NEEDS_GROUPING",
    `No single capability can fill ${targetedSlots} targeted slots alone; the selector must target a GROUP of weak capabilities.`,
    { targetedSlots, minBroadSlots });
}

/* ── 7. PROVENANCE AND REVIEW ────────────────────────────────────────────── */
const provenance = {};
for (const v of VERSION_IDS) {
  const p = assess.PROVENANCE[v];
  provenance[v] = p;
  if (!p || !p.source) fail("NO_PROVENANCE", `${v} has no recorded provenance`, v);
  const blob = JSON.stringify(p).toLowerCase();
  if (/goethe|telc/.test(blob)) {
    fail("FALSE_PROVENANCE", `${v} provenance names an exam board`, v);
  }
}
const reviewStatus = Object.fromEntries(VERSION_IDS.map(v => [v, REVIEW[v]]));
const reviewed = VERSION_IDS.filter(v => REVIEW[v].status === "reviewed");
if (reviewed.length) {
  note("REVIEWED", `${reviewed.join(", ")} marked reviewed`, reviewed);
} else {
  note("UNREVIEWED", `All ${VERSION_IDS.length} versions are draft. No SME review is recorded anywhere.`, VERSION_IDS);
}

/* ── REPORT ──────────────────────────────────────────────────────────────── */
const report = {
  generatedAt: new Date().toISOString(),
  blueprint: {
    targetMinutes: BLUEPRINT.time.targetMinutes,
    comparableItemCount: BLUEPRINT.comparableItemCount,
    objectiveItemCount: BLUEPRINT.objectiveItemCount,
    skillWeighting: BLUEPRINT.skillWeighting,
    capabilityWeighting: BLUEPRINT.capabilityWeighting,
    checkWeighting: BLUEPRINT.checkWeighting,
  },
  coverage, keyBalance, burden,
  duplication: dup,
  practiceOverlap: overlap,
  comparisons,
  variantsPerSlot: variants,
  capabilityDepth: capDepth,
  mixFeasibility,
  provenance, reviewStatus,
  findings,
  totals: {
    items: ITEMS.length,
    fails: findings.filter(f => f.level === "FAIL").length,
    warns: findings.filter(f => f.level === "WARN").length,
    notes: findings.filter(f => f.level === "NOTE").length,
  },
};

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const line = (s = "") => console.log(s);
  line("B2 ASSESSMENT CONTENT AUDIT");
  line("=".repeat(66));
  line(`items ${ITEMS.length}   versions ${VERSION_IDS.join(", ")}`);
  line();
  line("COVERAGE");
  for (const v of VERSION_IDS) {
    line(`  ${v}  ${coverage.itemsPerVersion[v]} items (${coverage.comparablePerVersion[v]} comparable), ` +
         `${burden[v].minutes} min`);
    line(`      skill      ${JSON.stringify(coverage.perSkill[v])}`);
    line(`      capability ${JSON.stringify(coverage.perCapability[v])}`);
    line(`      format     ${JSON.stringify(coverage.perFormat[v])}`);
  }
  line();
  line("BLUEPRINT COMPARISON");
  for (const c of comparisons) {
    line(`  ${c.a} vs ${c.b}: ${c.structurallyComparable ? "comparable structure" : "NOT COMPARABLE"}` +
         `  items ${JSON.stringify(c.itemCount)}  shared items ${c.sharedItemIds.length}`);
  }
  line();
  line("POOL DEPTH (variants per slot)");
  const depths = Object.entries(variants).map(([s, ids]) => `${s}:${ids.length}`).join("  ");
  line("  " + depths);
  line();
  line("CAPABILITY DEPTH");
  for (const [cap, d] of Object.entries(capDepth).sort((a, b) => b[1].total - a[1].total)) {
    line(`  ${cap.padEnd(18)} ${String(d.total).padStart(2)} total   ` +
         `unused after sitting v1/v2/v3: ${Object.values(d.unusedIfSat).join("/")}`);
  }
  line();
  line("DUPLICATION");
  line(`  repeated item ids ${dup.itemIds.length}   stems ${dup.stems.length}   ` +
       `option sets ${dup.optionSets.length}   passages ${dup.passages.length}   ` +
       `transcripts ${dup.transcripts.length}   prompts ${dup.prompts.length}`);
  line();
  line("PRACTICE OVERLAP");
  line(`  declared ${overlap.declared.length}   textual ${overlap.textual.length}`);
  for (const d of overlap.declared) line(`    ${d.version} ${d.skill} → ${d.practiceTopic}`);
  line();
  line("FINDINGS");
  for (const f of findings) line(`  ${f.level.padEnd(4)} ${f.code.padEnd(26)} ${f.msg}`);
  line();
  line(`FAIL ${report.totals.fails}   WARN ${report.totals.warns}   NOTE ${report.totals.notes}`);
}

process.exit(report.totals.fails ? 1 : 0);
