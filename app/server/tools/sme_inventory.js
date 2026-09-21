#!/usr/bin/env node
/**
 * CLI Tool: SME Content Inventory & Governance Inspector
 *
 * Run: node tools/sme_inventory.js
 */

const { getContentInventory, getGovernanceSummary } = require("../src/b2/governance");
const pool = require("../src/db/pool");

async function main() {
  console.log("==================================================");
  console.log("SKILLCASE B2 — SME CONTENT INVENTORY & GOVERNANCE");
  console.log("==================================================\n");

  const summary = await getGovernanceSummary();
  console.log(`Total Tracked Content Units: ${summary.totalUnits}`);
  console.log("\nBreakdown by Module:");
  for (const [mod, count] of Object.entries(summary.byModule)) {
    console.log(`  - ${mod.padEnd(14)}: ${count}`);
  }

  console.log("\nBreakdown by Review Status:");
  for (const [st, count] of Object.entries(summary.byStatus)) {
    console.log(`  - ${st.padEnd(14)}: ${count}`);
  }

  console.log("\nBreakdown by Provenance (Source Type):");
  for (const [src, count] of Object.entries(summary.byProvenance)) {
    console.log(`  - ${src.padEnd(16)}: ${count}`);
  }

  console.log("\n--------------------------------------------------");
  console.log("EXAM PAPERS & DIAGNOSTIC INSTRUMENTS");
  console.log("--------------------------------------------------");
  const examUnits = await getContentInventory({ module: "exam" });
  for (const u of examUnits) {
    console.log(`[${u.exam_family.toUpperCase()}] ${u.id.padEnd(28)} | ${u.title.padEnd(30)} | status: ${u.review_status} | source: ${u.source_type}`);
  }

  const diagUnits = await getContentInventory({ module: "diagnostic" });
  console.log("\nDIAGNOSTIC INSTRUMENTS:");
  for (const u of diagUnits) {
    console.log(`[DIAGNOSTIC] ${u.id.padEnd(26)} | ${u.title.padEnd(30)} | status: ${u.review_status}`);
  }

  console.log("\n==================================================");
  console.log("SME INVENTORY AUDIT COMPLETE");
  console.log("==================================================");

  await pool.end();
}

main().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
