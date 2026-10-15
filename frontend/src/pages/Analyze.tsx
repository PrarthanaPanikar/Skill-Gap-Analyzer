import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Analysis } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ReadinessBar from "../components/ReadinessBar";

const STATUS_CLASS: Record<string, string> = {
  missing: "badge-missing",
  weak:    "badge-weak",
  strong:  "badge-strong",
};
const STATUS_LABEL: Record<string, string> = {
  missing: "Missing",
  weak:    "Mentioned once",
  strong:  "Shown clearly",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-bold text-[#E8F1F6]">{children}</h2>
  );
}

export default function Analyze() {
  const { target } = useAuth();
  const [result, setResult] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [weeks, setWeeks] = useState(12);
  const [building, setBuilding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.latest().then(setResult).catch(() => {});
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setResult(await api.analyze(file));
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function buildRoadmap() {
    if (!result) return;
    setBuilding(true);
    try {
      const roadmap = await api.roadmap(result.id, weeks);
      setResult({ ...result, roadmap });
    } catch (e: any) {
      setError(e.message);
    }
    setBuilding(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="min-h-screen bg-[#0B1D2E]">
      {/* Ambient orb */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-0 right-0 h-[350px] w-[350px] rounded-full bg-[#3B6EF8]/6 blur-[100px]" />
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-12">
        {/* Page header */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#7FA3B8]">Resume analysis</p>
            <h1 className="font-display text-3xl font-bold text-[#E8F1F6]">
              {target?.role ?? "Your role"}
            </h1>
            {target?.companies.length ? (
              <p className="mt-1 text-sm text-[#7FA3B8]">
                Targeting{" "}
                <span className="text-[#A8C4D4]">{target.companies.join(", ")}</span>
              </p>
            ) : null}
          </div>
          <Link
            to="/onboarding"
            className="btn-ghost mt-1 text-xs"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Change role
          </Link>
        </header>

        {/* Upload zone */}
        <section>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <button
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            disabled={busy}
            aria-label="Upload resume"
            className={`w-full rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B6EF8] disabled:cursor-not-allowed disabled:opacity-60 ${
              dragOver
                ? "border-[#3B6EF8] bg-[#3B6EF8]/10"
                : "border-[#1E3D55] bg-[#112638]/50 hover:border-[#3B6EF8]/60 hover:bg-[#112638]"
            }`}
          >
            {busy ? (
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B6EF8]/30 border-t-[#3B6EF8]" />
                <p className="text-sm font-medium text-[#A8C4D4]">Reading your resume and scoring it…</p>
                <p className="text-xs text-[#7FA3B8]">This takes about 20 seconds</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#1E3D55] bg-[#0B1D2E]">
                  <svg className="h-6 w-6 text-[#3B6EF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#E8F1F6]">
                    {result ? "Upload an updated resume" : "Drop your resume here"}
                  </p>
                  <p className="text-xs text-[#7FA3B8]">PDF or DOCX · up to 5 MB · click or drag</p>
                </div>
              </div>
            )}
          </button>

          {error && (
            <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl border border-[#E05252]/30 bg-[#E05252]/10 px-4 py-3 text-sm text-[#E05252]">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </section>

        {/* ── Results ── */}
        {result && !busy && (
          <div className="mt-12 space-y-10">

            {/* Readiness bar */}
            <ReadinessBar score={result.match_score} role={result.role} />

            {/* Summary */}
            <p className="rounded-2xl border border-[#1E3D55] bg-[#112638] px-6 py-5 text-base leading-relaxed text-[#A8C4D4]">
              {result.guidance.summary}
            </p>

            {/* ATS Score */}
            <section>
              <div className="mb-5 flex items-baseline justify-between">
                <SectionHeading>ATS Score</SectionHeading>
                <span className="font-display text-3xl font-bold text-[#3B6EF8]">
                  {result.ats.total}<span className="text-base font-normal text-[#7FA3B8]">/100</span>
                </span>
              </div>

              <div className="card space-y-5">
                {Object.entries(result.ats.breakdown).map(([k, v]) => (
                  <div key={k}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium capitalize text-[#E8F1F6]">
                        {k === "format" ? "Length & readability" : k}
                      </span>
                      <span className="text-[#7FA3B8]">{v.score}<span className="text-[#1E3D55]">/{v.max}</span></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#0B1D2E]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3B6EF8] to-[#6A9BFF] transition-[width] duration-500"
                        style={{ width: `${(v.score / v.max) * 100}%` }}
                      />
                    </div>
                    {v.note && <p className="mt-1 text-xs text-[#7FA3B8]">{v.note}</p>}
                  </div>
                ))}

                {result.ats.tips.length > 0 && (
                  <ul className="mt-2 space-y-1.5 border-t border-[#1E3D55] pt-4">
                    {result.ats.tips.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-[#A8C4D4]">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#D49A3A]" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 3.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zm0 5.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Skills */}
            <section>
              <SectionHeading>Skills assessment</SectionHeading>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span key={s.skill} className={STATUS_CLASS[s.status]}>
                    {s.skill}
                    {s.tier === "core" ? " ★" : ""}
                    <span className="ml-1 opacity-60">· {STATUS_LABEL[s.status]}</span>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#7FA3B8]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#34C48A]" />Strong</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D49A3A]" />Mentioned once</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E05252]" />Missing</span>
                <span className="flex items-center gap-1.5">★ Core skill</span>
              </div>
            </section>

            {/* Company focus */}
            {result.guidance.company_focus?.length ? (
              <section>
                <SectionHeading>What your target companies look for</SectionHeading>
                <dl className="mt-4 space-y-3">
                  {result.guidance.company_focus.map((c) => (
                    <div key={c.company} className="card">
                      <dt className="mb-1 text-sm font-semibold text-[#E8F1F6]">{c.company}</dt>
                      <dd className="text-sm text-[#7FA3B8]">{c.emphasis}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {/* Projects */}
            <section>
              <SectionHeading>Projects to build</SectionHeading>
              {result.guidance.project_feedback && (
                <p className="mt-3 text-sm text-[#7FA3B8]">{result.guidance.project_feedback}</p>
              )}
              <ul className="mt-4 space-y-5">
                {(result.guidance.project_suggestions ?? []).map((p) => (
                  <li key={p.title} className="card border-l-4 border-l-[#3B6EF8]">
                    <h3 className="text-base font-semibold text-[#E8F1F6]">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-[#7FA3B8]">{p.why}</p>
                    <p className="mt-2 text-sm text-[#A8C4D4]">{p.scope}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#7FA3B8]">
                      <span className="font-medium text-[#3B6EF8]">Stack:</span>
                      {p.stack.map((tech) => (
                        <span key={tech} className="rounded-md border border-[#1E3D55] bg-[#0B1D2E] px-2 py-0.5">{tech}</span>
                      ))}
                    </p>
                    <p className="mt-3 rounded-lg border border-[#1E3D55] bg-[#0B1D2E] px-3 py-2 text-xs italic text-[#A8C4D4]">
                      Resume bullet: {p.resume_bullet}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Roadmap */}
            <section>
              <SectionHeading>Learning roadmap</SectionHeading>
              {result.roadmap ? (
                <ol className="mt-4 space-y-4">
                  {result.roadmap.phases.map((ph, i) => (
                    <li key={ph.title} className="card flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3B6EF8]/20 text-sm font-bold text-[#3B6EF8]">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-base font-semibold text-[#E8F1F6]">{ph.title}</h3>
                          <span className="text-xs text-[#7FA3B8]">weeks {ph.weeks}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-[#A8C4D4]">
                          <span className="text-[#7FA3B8]">Goals: </span>{ph.goals.join(", ")}
                        </p>
                        {ph.resources.length > 0 && (
                          <p className="mt-1 text-xs text-[#7FA3B8]">
                            Resources: {ph.resources.join(" · ")}
                          </p>
                        )}
                        <p className="mt-2 rounded-lg border border-[#1E3D55] bg-[#0B1D2E] px-3 py-1.5 text-xs text-[#A8C4D4]">
                          <span className="text-[#3B6EF8]">Checkpoint: </span>{ph.milestone}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="card mt-4">
                  <p className="text-sm text-[#7FA3B8]">
                    {result.roadmap_recommended
                      ? "You have some gaps to close — a personalised roadmap will speed things up."
                      : "You're close to interview-ready. Want a plan to close the remaining gaps?"}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label htmlFor="weeks" className="text-sm font-medium text-[#A8C4D4]">
                      Weeks available
                    </label>
                    <input
                      id="weeks"
                      type="number"
                      min={2}
                      max={52}
                      value={weeks}
                      onChange={(e) => setWeeks(+e.target.value)}
                      className="w-20 rounded-xl border border-[#1E3D55] bg-[#0B1D2E] px-3 py-2 text-center text-sm text-[#E8F1F6] focus:border-[#3B6EF8] focus:outline-none focus:ring-2 focus:ring-[#3B6EF8]/20"
                    />
                    <button
                      onClick={buildRoadmap}
                      disabled={building}
                      className="btn-primary"
                    >
                      {building ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Building your roadmap…
                        </>
                      ) : (
                        "Build my roadmap"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
