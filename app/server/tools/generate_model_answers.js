#!/usr/bin/env node
/**
 * GUIDANCE + EXPECTED ANSWER for every open (writing / speaking) task.
 *
 *   node tools/generate_model_answers.js          # fills gaps, resumes
 *   node tools/generate_model_answers.js --force  # regenerates everything
 *
 * Open tasks (LONG_TEXT, SHORT_TEXT, SPOKEN_RESPONSE) have no answer key —
 * they are scored against a rubric. For hand-over, each one gets:
 *   guidance        — 3-5 German bullet points: what a strong answer covers
 *   expected_answer — one B2-level model answer at the task's target length
 *
 * Drafted by the project's configured model (src/b2/model.js's Azure
 * deployment) and saved to src/seed/b2/model_answers.json, keyed
 * "<paper_id>#<module>#<item_no>" (item numbers restart per section). NOTHING in the database is modified. Every entry
 * is marked review_status "AI_DRAFT_UNREVIEWED" — a teacher should read them
 * before any learner sees them. Existing author-written guidance/criteria on
 * an item are passed to the model and kept, not overwritten.
 */
require("../src/env")();
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");
const { azureUrl } = require("../src/b2/model");

const OUT = path.join(__dirname, "../src/seed/b2/model_answers.json");
const FORCE = process.argv.includes("--force");
const KEY = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
const MODEL = process.env.AZURE_AI_DEPLOYMENT || "deepseek-v4-pro";
const PARALLEL = 5;

const cache = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const save = () => fs.writeFileSync(OUT, JSON.stringify(cache, null, 2) + "\n");

function prompt(it) {
  const p = it.payload || {};
  const spoken = it.item_type === "SPOKEN_RESPONSE";
  const words = spoken
    ? `ca. ${Math.round(((p.speak_seconds || 90) / 60) * 110)} Wörter (gesprochen, ${p.speak_seconds || 90} Sekunden)`
    : `ca. ${p.target_words || p.min_words || 80} Wörter (mindestens ${p.min_words || 40})`;
  return [
    "Du bist erfahrene/r DaF-Prüfer/in (Goethe/telc, Niveau B2).",
    "Erstelle für die folgende Aufgabe:",
    "1) \"guidance\": 3 bis 5 kurze Stichpunkte auf Deutsch — was eine starke B2-Antwort enthalten muss (Inhalt, Aufbau, typische Redemittel).",
    `2) "expected_answer": EINE Musterantwort auf Deutsch, klar B2-Niveau, natürlich formuliert, ${words}.`,
    spoken ? "Die Musterantwort ist ein gesprochener Monolog (keine Überschriften, keine Stichpunkte)." : "Die Musterantwort ist ein zusammenhängender Text im passenden Register (E-Mail mit Anrede/Gruß, falls eine E-Mail verlangt ist).",
    "Antworte ausschließlich als JSON: {\"guidance\":[\"...\"],\"expected_answer\":\"...\"}",
    "",
    `Aufgabentyp: ${it.item_type}`,
    it.instruction ? `Anweisung: ${it.instruction}` : "",
    `Aufgabe: ${it.stem}`,
    p.guidance?.length ? `Vorgegebene Leitpunkte: ${p.guidance.join(" | ")}` : "",
    p.expected ? `Erwartung laut Autor: ${p.expected}` : "",
    it.passage ? `Bezugstext:\n---\n${String(it.passage).slice(0, 2500)}\n---` : "",
  ].filter(Boolean).join("\n");
}

async function ask(text) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(azureUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": KEY, Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: text }],
          max_tokens: 1500, temperature: 0.4, response_format: { type: "json_object" } }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()).choices?.[0]?.message?.content || "";
      const j = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, ""));
      if (!Array.isArray(j.guidance) || !j.guidance.length || typeof j.expected_answer !== "string" || j.expected_answer.length < 40)
        throw new Error("bad shape");
      return j;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

(async () => {
  const items = (await pool.query(
    `SELECT s.paper_id, s.module, i.item_no, i.item_type, i.stem, i.payload, s.instruction, s.passage
       FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE i.item_type IN ('LONG_TEXT','SHORT_TEXT','SPOKEN_RESPONSE')
      ORDER BY s.paper_id, i.item_no`)).rows;
  const todo = items.filter(it => FORCE || !cache[`${it.paper_id}#${it.module}#${it.item_no}`]);
  console.log(`${items.length} open tasks, ${todo.length} to generate`);

  let done = 0, failed = [];
  const queue = [...todo];
  await Promise.all(Array.from({ length: PARALLEL }, async () => {
    while (queue.length) {
      const it = queue.shift();
      const id = `${it.paper_id}#${it.module}#${it.item_no}`;
      try {
        const j = await ask(prompt(it));
        cache[id] = {
          guidance: j.guidance.map(String),
          expected_answer: j.expected_answer.trim(),
          review_status: "AI_DRAFT_UNREVIEWED",
          model: MODEL,
          generated_at: new Date().toISOString(),
        };
        save();
      } catch (e) { failed.push(`${id} (${e.message})`); }
      done++;
      if (done % 10 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`);
    }
  }));

  console.log(`done. ${Object.keys(cache).length} cached, ${failed.length} failed`);
  if (failed.length) console.log(failed.join("\n"));
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
