import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

/* ── Sample preview data – clearly labelled as demo ── */
const SAMPLE_SKILLS = [
  { label: "React", status: "strong" },
  { label: "TypeScript", status: "strong" },
  { label: "System Design", status: "weak" },
  { label: "Kubernetes", status: "missing" },
  { label: "GraphQL", status: "missing" },
];

const SAMPLE_PHASES = [
  { week: "Wk 1–2", title: "System Design fundamentals" },
  { week: "Wk 3–5", title: "Kubernetes & container orchestration" },
  { week: "Wk 6–8", title: "GraphQL API design & practice" },
];

const STATUS_STYLE: Record<string, string> = {
  strong:  "badge-strong",
  weak:    "badge-weak",
  missing: "badge-missing",
};

export default function Login() {
  const { signInWithGoogle, ready, signedIn, target, sessionError } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Once AuthContext finishes processing onAuthStateChanged (ready=true, signedIn=true),
  // redirect away. This handles both the sign-in popup flow and page refreshes where
  // the user was already authenticated.
  useEffect(() => {
    if (ready && signedIn) {
      navigate(target ? "/analyze" : "/onboarding", { replace: true });
    }
  }, [ready, signedIn, target, navigate]);

  // Show backend session errors (e.g. server down) surfaced by AuthContext
  useEffect(() => {
    if (sessionError) {
      setError(sessionError);
      setBusy(false);
    }
  }, [sessionError]);

  async function go() {
    setBusy(true);
    setError("");
    try {
      // signInWithPopup resolves when the popup closes.
      // onAuthStateChanged in AuthContext will fire next, call api.session(),
      // set signedIn=true, then the useEffect above navigates away.
      await signInWithGoogle();
    } catch (e: any) {
      if (e?.code !== "auth/popup-closed-by-user") {
        if (e?.message?.includes("backend") || e?.message?.includes("fetch") || e?.message?.includes("500")) {
          setError("Signed in with Google but couldn't reach the server. Make sure the backend is running and try again.");
        } else {
          setError("Google sign-in failed. Check your connection and try again.");
        }
      }
      setBusy(false);
    }
    // Don't setBusy(false) on success — keep the spinner visible while
    // onAuthStateChanged + api.session() complete and the navigation fires.
  }

  return (
    <div className="min-h-screen bg-[#0B1D2E]">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#3B6EF8]/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-48 h-[400px] w-[400px] rounded-full bg-[#6A3BF8]/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[#3B6EF8]/6 blur-[80px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-20">

        {/* ── LEFT: Hero copy + CTA ── */}
        <div className="flex flex-col">
          {/* Brand lockup */}
          <Logo variant="lockup" size={44} className="mb-8" />

          {/* Badge */}
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#3B6EF8]/30 bg-[#3B6EF8]/10 px-4 py-1.5 text-xs font-medium text-[#A8C4D4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3B6EF8] animate-pulse" />
            AI-powered career readiness
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.1] text-[#E8F1F6] sm:text-5xl lg:text-[3.25rem]">
            See exactly what stands between your resume
            <span className="block bg-gradient-to-r from-[#3B6EF8] to-[#A8C4D4] bg-clip-text text-transparent">
              and the offer.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[#7FA3B8]">
            Pick a role and your dream companies, upload your resume, and get an ATS score,
            a skill-gap list, personalised projects to build, and a learning roadmap to close it.
          </p>

          {/* Feature pills */}
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Features">
            {["ATS scoring", "Skill-gap detection", "Project ideas", "Learning roadmap"].map((f) => (
              <li key={f} className="flex items-center gap-1.5 rounded-full border border-[#1E3D55] bg-[#112638] px-3.5 py-1.5 text-xs text-[#A8C4D4]">
                <svg className="h-3 w-3 shrink-0 text-[#3B6EF8]" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-10">
            <button
              onClick={go}
              disabled={busy}
              className="btn-primary py-3.5 px-7 text-base"
              aria-busy={busy}
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
              </svg>
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  Signing in…
                </>
              ) : "Continue with Google"}
            </button>
            {error && (
              <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-[#E05252]">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            <p className="mt-4 text-xs text-[#7FA3B8]">
              Free to use · No credit card required
            </p>
          </div>
        </div>

        {/* ── RIGHT: Sample dashboard preview ── */}
        <div className="relative hidden lg:block" aria-label="Sample analysis preview">
          {/* Sample label */}
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full border border-[#D49A3A]/40 bg-[#D49A3A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#D49A3A]">
              Sample preview
            </span>
          </div>

          <div className="card glow-blue space-y-5 pt-8">
            {/* ATS score row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#7FA3B8]">ATS Score</p>
                <p className="font-display text-4xl font-bold text-[#E8F1F6]">74<span className="text-xl text-[#7FA3B8]">/100</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-[#7FA3B8]">Skill match</p>
                <p className="font-display text-4xl font-bold text-[#3B6EF8]">68<span className="text-xl text-[#7FA3B8]">%</span></p>
              </div>
            </div>

            {/* Readiness bar */}
            <div>
              <div className="relative h-3 overflow-hidden rounded-full bg-[#0B1D2E]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3B6EF8] to-[#6A9BFF] transition-all" style={{ width: "68%" }} />
                <div className="absolute top-0 bottom-0 w-px bg-[#E8F1F6]/60" style={{ left: "70%" }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[#7FA3B8]">
                <span>Your match</span>
                <span>70% interview-ready</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#7FA3B8]">Skills assessment</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SKILLS.map((s) => (
                  <span key={s.label} className={STATUS_STYLE[s.status]}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Roadmap phases */}
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#7FA3B8]">Learning roadmap</p>
              <ol className="space-y-2">
                {SAMPLE_PHASES.map((ph, i) => (
                  <li key={ph.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3B6EF8]/20 text-[10px] font-bold text-[#3B6EF8]">
                      {i + 1}
                    </span>
                    <div>
                      <span className="block text-xs font-medium text-[#E8F1F6]">{ph.title}</span>
                      <span className="text-[10px] text-[#7FA3B8]">{ph.week}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Role chip */}
            <div className="flex items-center justify-between border-t border-[#1E3D55] pt-4">
              <span className="rounded-full bg-[#3B6EF8]/15 px-3 py-1 text-xs text-[#A8C4D4]">Frontend Engineer</span>
              <span className="text-[10px] text-[#7FA3B8]">Targeting: Google, Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-[#1E3D55] py-5 text-center text-xs text-[#7FA3B8]">
        <p>© {new Date().getFullYear()} SkillGap · Built to help you land the role you want</p>
      </footer>
    </div>
  );
}
