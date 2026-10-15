"""Explainable ATS score: 80 points deterministic + 20 points semantic (LLM)."""
import re

from app.services.skills import count_skill

ACTION_VERBS = {
    "built", "developed", "designed", "implemented", "created", "led", "optimized", "reduced",
    "improved", "automated", "deployed", "architected", "integrated", "launched", "migrated",
    "engineered", "analyzed", "trained", "managed", "delivered", "refactored", "scaled", "wrote",
    "collaborated", "increased", "achieved", "configured", "established", "streamlined", "won",
}
BULLET = re.compile(r"^\s*[-\u2022*\u25aa\u2013\u00b7]\s+(.*)")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE = re.compile(r"(\+?\d[\d\s().-]{8,}\d)")
WEIGHTS = {"keywords": 35, "sections": 15, "bullets": 20, "format": 10, "relevance": 20}


def _bullets(text: str, sections: dict) -> list[str]:
    found = [m.group(1) for line in text.splitlines() if (m := BULLET.match(line))]
    if found:
        return found
    body = (sections.get("experience", "") + "\n" + sections.get("projects", "")).splitlines()
    return [l.strip() for l in body if len(l.split()) > 6]


def score(text: str, sections: dict, profile: dict, llm=None, role: str = "") -> dict:
    # 1. keyword coverage (core skills count double)
    total = earned = 0
    for tier, w in (("core", 2), ("nice", 1)):
        for s in profile[tier]:
            total += w
            earned += w if count_skill(text, s) else 0
    kw_ratio = earned / total if total else 0

    # 2. sections + contact info
    needed = ["experience", "education", "skills", "projects"]
    present = [s for s in needed if sections.get(s)]
    contact = int(bool(EMAIL.search(text))) + int(bool(PHONE.search(text)))
    sec_ratio = (len(present) / len(needed)) * 0.8 + (contact / 2) * 0.2

    # 3. bullet quality: action verb + a number
    bl = _bullets(text, sections)
    if bl:
        per = [
            0.5 * (b.split()[0].lower().strip(",.") in ACTION_VERBS) + 0.5 * bool(re.search(r"\d", b))
            for b in bl
        ]
        bullet_ratio = sum(per) / len(per)
    else:
        bullet_ratio = 0.0

    # 4. length / parseability
    words = len(text.split())
    fmt_ratio = 1.0 if 350 <= words <= 900 else 0.6 if 200 <= words < 350 or 900 < words <= 1200 else 0.3
    if len(re.findall(r"[^\x00-\x7f]", text)) > words * 0.05:
        fmt_ratio *= 0.7  # heavy special characters often break ATS parsers

    # 5. semantic relevance (falls back to keyword coverage if the LLM is unavailable)
    rel_ratio, rel_note = kw_ratio, "Estimated from keyword coverage."
    if llm is not None:
        try:
            out = llm.complete_json(
                "You are a strict technical recruiter. Return only JSON.",
                f'Role: {role}\n\nResume:\n{text[:6000]}\n\nHow well does this resume read for the role? '
                f'Return {{"score": 0-100, "reason": "one sentence"}}.',
                max_tokens=300,
            )
            rel_ratio = max(0, min(100, float(out["score"]))) / 100
            rel_note = str(out.get("reason", ""))
        except Exception:
            pass

    parts = {
        "keywords": kw_ratio, "sections": sec_ratio, "bullets": bullet_ratio,
        "format": fmt_ratio, "relevance": rel_ratio,
    }
    breakdown = {k: {"score": round(parts[k] * WEIGHTS[k]), "max": WEIGHTS[k]} for k in parts}
    breakdown["relevance"]["note"] = rel_note
    tips = []
    if kw_ratio < 0.6:
        tips.append("Add the role's key skills to your Skills section and show them in project or experience bullets.")
    missing_sec = [s for s in needed if s not in present]
    if missing_sec:
        tips.append("Add standard section headings: " + ", ".join(s.title() for s in missing_sec) + ".")
    if contact < 2:
        tips.append("Include both an email address and a phone number at the top.")
    if bullet_ratio < 0.5:
        tips.append("Start bullets with an action verb and add a number (users, % improvement, time saved).")
    if words < 350 or words > 900:
        tips.append("Aim for roughly one page of text (350-900 words).")
    return {"total": sum(v["score"] for v in breakdown.values()), "breakdown": breakdown, "tips": tips}
