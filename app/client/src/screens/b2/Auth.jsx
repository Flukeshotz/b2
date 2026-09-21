import { useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";

/* THE LOGIN GATE.
   ═══════════════════════════════════════════════════════════════════════════
   Every learner-data route on the server now requires a real session (see
   routes/b2.js's requireAuth mount) — there is no version of this app that
   works without this screen existing. Deliberately minimal to match the
   server: email + password, no verification email, no password reset. Real
   gaps, not hidden — see B2_PRODUCTION_MASTER_MATRIX.md. */
export default function Auth({ onDone }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const canSubmit = !busy && email.trim().length > 0 && password.length >= 8;

  const submit = async () => {
    setBusy(true); setError(null);
    const r = mode === "login" ? await b2.login(email, password) : await b2.signup(email, password);
    setBusy(false);
    if (r.error) {
      setError(r.error === "invalid_credentials" ? "Wrong email or password."
        : r.error === "email_taken" ? "That email is already registered — try logging in instead."
        : r.error === "weak_password" ? "Password must be at least 8 characters."
        : "Something went wrong. Try again.");
      return;
    }
    onDone();
  };

  const handleDemo = async () => {
    setBusy(true); setError(null);
    const r = await b2.demoLogin();
    setBusy(false);
    if (r.error) {
      setError("Could not log in as demo learner.");
      return;
    }
    onDone();
  };

  return (
    <div className="b2">
      <Bar section="Skillcase B2" />
      <Well style={{ gap: 14, paddingTop: 24 }}>
        <h1 className="b2-title">{mode === "login" ? "Log in" : "Create your account"}</h1>
        <input className="b2-write" style={{ flex: "none", minHeight: 0, height: 48, padding: "0 14px" }}
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        <input className="b2-write" style={{ flex: "none", minHeight: 0, height: 48, padding: "0 14px" }}
          type="password" placeholder="Password (min. 8 characters)" value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onKeyDown={e => e.key === "Enter" && canSubmit && submit()} />
        {error && <StateMessage state="error" message={error} />}
        <button type="button" className="b2-note" style={{ background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer" }}
          onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(null); }}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </Well>
      <Foot>
        <B2Cta ghost onClick={handleDemo}>
          Continue as Demo Learner (Priya)
        </B2Cta>
        <B2Cta disabled={!canSubmit} onClick={submit}>
          {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
        </B2Cta>
      </Foot>
    </div>
  );
}
