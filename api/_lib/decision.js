// Decisions for membership + workshop applications: lookup by confirmation number,
// letter text (editable in Admin → Settings → Decision letters), and the "decision ready" email.
import { cmd, P, parse } from "./kv.js";

export const FINAL = ["accepted", "waitlisted", "declined"];

export const DEFAULT_LETTERS = {
  accepted: `On behalf of the board, it is our pleasure to offer you a place in {program}.

We read every application closely this cycle, and yours stood out for the curiosity you bring and for how clearly you think about the business behind the screen. We are genuinely excited to have you with us.

In the coming days you will receive an email with your next steps, including our first meeting time and onboarding details. Please keep an eye on your inbox, and reply to that email to confirm your place.

Congratulations, and welcome to Greenlight.`,
  waitlisted: `Thank you for applying to {program}, and for the time and care you put into your application.

We were impressed by the depth of this year's applicants, and we would like to keep your application under active consideration by placing you on our waitlist. Places often open as our cohort is finalized, and we will contact you by email as soon as we know more.

In the meantime, our speaker events, screenings and open workshops remain available to you, and we would be glad to see you there.`,
  declined: `Thank you for applying to {program}, and for the time and thought you put into your application.

This cycle we received many more strong applications than we have places, and after careful consideration we are unable to offer you a place at this time. We know this is not the news you were hoping for.

This decision is not a measure of your potential. Many of our current members applied more than once, and we would sincerely welcome your application in a future cycle.

Our speaker events, screenings and many of our workshops are open to all Vanderbilt students. We hope to see you there, and we wish you every success this year.`,
};

export const programName = (kind, settings = {}, ws) =>
  kind === "workshop" ? `the ${String(ws?.title || "").replace(/^the\s+/i, "").replace(/\s+workshop$/i, "") || "Greenlight"} workshop` : `the ${settings.season ? settings.season + " " : ""}cohort of Vanderbilt Greenlight`;

export function letterBody(status, { first, program, settings = {} }) {
  const tpl = (settings.decisionLetters && settings.decisionLetters[status]) || DEFAULT_LETTERS[status] || "";
  return tpl.replace(/\{first\}/g, first).replace(/\{program\}/g, program).replace(/\{season\}/g, settings.season || "");
}

// Normalise what applicants type: "vf 3fq2k3", "VF-3FQ2K3", "ws-ab12cd", "AB12CD"
export function normalizeCode(raw) {
  const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^VF[A-Z0-9]{6}$/.test(s)) return { kind: "membership", id: "VF-" + s.slice(2) };
  const w = s.replace(/^WS/, "");
  if (/^[A-Z0-9]{6}$/.test(w)) return { kind: "workshop", short: w };
  return null;
}

// Returns { kind, app, key, field, ws } or null.
export async function findApplication(code, content) {
  const n = normalizeCode(code);
  if (!n) return null;
  if (n.kind === "membership") {
    const app = parse(await cmd("HGET", P + "apps", n.id));
    return app ? { kind: "membership", app, key: P + "apps", field: n.id, ref: n.id } : null;
  }
  let full = await cmd("GET", `${P}wscode:${n.short}`);
  if (!full) {
    for (const w of content.workshops || []) {
      const f = `${w.id}:${n.short}`;
      if (await cmd("HEXISTS", `${P}wsapps:${w.id}`, f)) { full = f; break; }
    }
  }
  if (!full) return null;
  const wsId = full.slice(0, full.lastIndexOf(":"));
  const app = parse(await cmd("HGET", `${P}wsapps:${wsId}`, full));
  if (!app) return null;
  const ws = (content.workshops || []).find((w) => w.id === wsId) || { id: wsId, title: "Workshop" };
  return { kind: "workshop", app, key: `${P}wsapps:${wsId}`, field: full, ws, ref: n.short };
}

// A decision is visible once the applicant has been notified of *this* status, or decisions are released globally.
export const decisionVisible = (app, settings = {}) => FINAL.includes(app.status) && (app.notifiedStatus === app.status || Boolean(settings.releaseDecisions));
