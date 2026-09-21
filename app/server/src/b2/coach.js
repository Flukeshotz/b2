/**
 * THE COACH — four fixed questions, answered only from the real report.
 *
 * Deliberately NOT a conversational AI. No LLM call, no free-text input, no
 * invented claim. Every sentence below is a template filled with a field from
 * `report.buildReport()` — if that field is null, the template says so
 * honestly rather than improvising around the gap. This satisfies the brief's
 * own rule for a first version: "Start with deterministic recommendation
 * logic... If an LLM is used, it must not determine scores or override
 * server-authoritative evidence." No LLM is used at all in this version.
 */

const report = require("./report");

const NICE = { grammar: "grammar", vocabulary: "vocabulary", reading: "reading",
               listening: "listening", writing: "writing", speaking: "speaking" };

const niceCapability = (c) => c ? c.replace(/_/g, " ") : null;

async function coachAdvice(userId) {
  const r = await report.buildReport(userId);
  const weak = r.capabilities.weakest[0];
  const next = r.recommendation;
  const delta = r.assessment.delta;

  const whatAmIWeakAt = weak
    ? niceCapability(weak.capability)
    : (r.profile.every(p => p.evidence_state === "none")
        ? "Nothing measured yet — take the assessment first."
        : "Nothing stands out as a clear weak point yet.");

  const why = weak
    ? `Across ${weak.items} measured item${weak.items === 1 ? "" : "s"}, this came out lowest of what we've seen so far.`
    : "There isn't enough evidence yet to point at one specific thing.";

  const whatToPractise = next
    ? next.title + (next.reason ? ` — ${next.reason}` : "")
    : "Nothing to recommend yet — take the assessment first, or come back after your next session.";

  const whatChanged = delta
    ? `${delta.direction === "up" ? "Improved" : delta.direction === "down" ? "Dropped" : "Stayed about the same"} since your last assessment (${delta.basis.latestMeasured} vs ${delta.basis.previousMeasured} measured items).`
    : (r.assessment.reason || "No comparison available yet.");

  return {
    generatedAt: new Date().toISOString(),
    whatAmIWeakAt,
    why,
    whatToPractise,
    whatChanged,
    recommendation: next,
    retestAvailable: !!next, // same signal Home already uses to offer a next action
    claim: "B2 coach — deterministic, built only from your own evidence. Not a certified assessment.",
  };
}

module.exports = { coachAdvice };
