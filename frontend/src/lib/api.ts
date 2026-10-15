import { auth } from "./firebase";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export type Target = { role: string; companies: string[] };
export type SkillItem = { skill: string; tier: "core" | "nice"; status: "strong" | "weak" | "missing" };
export type RoadmapPhase = { title: string; weeks: string; goals: string[]; resources: string[]; milestone: string };
export type Roadmap = { timeline_weeks: number; phases: RoadmapPhase[] };
export type Analysis = {
  id: number;
  filename: string;
  role: string;
  companies: string[];
  match_score: number;
  roadmap_recommended: boolean;
  ats: {
    total: number;
    breakdown: Record<string, { score: number; max: number; note?: string }>;
    tips: string[];
  };
  skills: SkillItem[];
  guidance: {
    summary: string;
    project_feedback?: string;
    company_focus?: { company: string; emphasis: string }[];
    project_suggestions?: { title: string; why: string; stack: string[]; scope: string; resume_bullet: string }[];
  };
  roadmap: Roadmap | null;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  session: () => request<{ user: { name: string; email: string }; target: Target | null }>("/auth/session", { method: "POST" }),
  roles: () => request<string[]>("/meta/roles"),
  setTarget: (t: Target) => request<Target>("/profile/target", { method: "PUT", body: JSON.stringify(t) }),
  analyze: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Analysis>("/resume/analyze", { method: "POST", body: form });
  },
  latest: () => request<Analysis | null>("/analysis/latest"),
  roadmap: (id: number, timeline_weeks: number) =>
    request<Roadmap>(`/analysis/${id}/roadmap`, { method: "POST", body: JSON.stringify({ timeline_weeks }) }),
};
