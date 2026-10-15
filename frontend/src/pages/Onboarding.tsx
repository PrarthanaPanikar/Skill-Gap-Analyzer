import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const OTHER = "Other role";

export default function Onboarding() {
  const { target, setTarget, name } = useAuth();
  const nav = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);
  const [role, setRole] = useState(target?.role ?? "");
  const [custom, setCustom] = useState("");
  const [companies, setCompanies] = useState<string[]>(target?.companies ?? []);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.roles().then(setRoles).catch(() => setError("Couldn't load roles. Refresh to retry."));
  }, []);

  function addCompany() {
    const c = draft.trim();
    if (c && companies.length < 5 && !companies.some((x) => x.toLowerCase() === c.toLowerCase()))
      setCompanies([...companies, c]);
    setDraft("");
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCompany();
    }
  };

  const chosen = role === OTHER ? custom.trim() : role;

  async function save() {
    setBusy(true);
    setError("");
    try {
      const t = await api.setTarget({ role: chosen, companies });
      setTarget(t);
      nav("/analyze");
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }

  const firstName = name.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#0B1D2E]">
      {/* Ambient orb */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#3B6EF8]/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <Logo variant="lockup" size={36} className="mb-6" />
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1E3D55] bg-[#112638] px-3.5 py-1.5 text-xs text-[#7FA3B8]">
            Step 1 of 2 · Set your target
          </span>
          <h1 className="font-display text-4xl font-bold text-[#E8F1F6]">
            Hi {firstName}, what are you aiming for?
          </h1>
          <p className="mt-3 text-[#7FA3B8]">
            Pick the role you want and the companies you're targeting. This shapes every analysis.
          </p>
        </div>

        <div className="space-y-8">
          {/* ── Role selector ── */}
          <div className="card">
            <fieldset>
              <legend className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#E8F1F6]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B6EF8]/20 text-xs font-bold text-[#3B6EF8]">1</span>
                Job role
              </legend>

              {roles.length === 0 && !error && (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-[#1E3D55]" />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[...roles, OTHER].map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3B6EF8] ${
                      role === r
                        ? "border-[#3B6EF8] bg-[#3B6EF8]/20 text-[#E8F1F6] shadow-lg shadow-[#3B6EF8]/20"
                        : "border-[#1E3D55] text-[#7FA3B8] hover:border-[#3B6EF8]/50 hover:text-[#E8F1F6]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {role === OTHER && (
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="e.g. Cloud Security Engineer"
                  className="input mt-4"
                  aria-label="Custom job role"
                />
              )}
            </fieldset>
          </div>

          {/* ── Company selector ── */}
          <div className="card">
            <div>
              <label
                htmlFor="co"
                className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#E8F1F6]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B6EF8]/20 text-xs font-bold text-[#3B6EF8]">2</span>
                Dream companies
                <span className="ml-auto text-xs font-normal text-[#7FA3B8]">{companies.length}/5</span>
              </label>

              {companies.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {companies.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1.5 rounded-full border border-[#3B6EF8]/30 bg-[#3B6EF8]/10 py-1.5 pl-3.5 pr-2 text-sm text-[#A8C4D4]"
                    >
                      {c}
                      <button
                        aria-label={`Remove ${c}`}
                        onClick={() => setCompanies(companies.filter((x) => x !== c))}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[#7FA3B8] transition-colors hover:bg-[#E05252]/20 hover:text-[#E05252]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                id="co"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                onBlur={addCompany}
                disabled={companies.length >= 5}
                placeholder={companies.length >= 5 ? "Limit reached" : "Type a company name and press Enter"}
                className="input"
              />
              <p className="mt-2 text-xs text-[#7FA3B8]">
                Press Enter or comma to add · Leave blank to analyze without targeting specific companies
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-[#E05252]/30 bg-[#E05252]/10 px-4 py-3 text-sm text-[#E05252]">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Save */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={save}
            disabled={busy || chosen.length < 2}
            className="btn-primary py-3.5 px-8"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                Save and upload resume
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
          {chosen.length < 2 && (
            <span className="text-xs text-[#7FA3B8]">Select a role to continue</span>
          )}
        </div>
      </div>
    </div>
  );
}
