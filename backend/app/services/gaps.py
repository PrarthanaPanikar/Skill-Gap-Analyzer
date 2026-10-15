from app.services.skills import count_skill

STATUS_VALUE = {"strong": 1.0, "weak": 0.5, "missing": 0.0}


def skill_gaps(text: str, profile: dict) -> tuple[list[dict], int]:
    items, total, earned = [], 0, 0.0
    for tier, w in (("core", 2), ("nice", 1)):
        for skill in profile[tier]:
            n = count_skill(text, skill)
            status = "strong" if n >= 2 else "weak" if n == 1 else "missing"
            items.append({"skill": skill, "tier": tier, "status": status})
            total += w
            earned += w * STATUS_VALUE[status]
    order = {"missing": 0, "weak": 1, "strong": 2}
    items.sort(key=lambda i: (order[i["status"]], i["tier"] != "core"))
    return items, round(100 * earned / total) if total else 0


def guidance(llm, role: str, companies: list[str], text: str, items: list[dict], match: int) -> dict:
    gaps = [i["skill"] for i in items if i["status"] != "strong"][:12]
    prompt = f"""Target role: {role}
Dream companies: {", ".join(companies) or "not specified"}
Skill match: {match}%. Missing or weak skills: {", ".join(gaps) or "none"}.

Resume:
{text[:6000]}

Return JSON:
{{"summary": "2-3 sentence honest assessment",
 "company_focus": [{{"company": "...", "emphasis": "what this company screens for in this role"}}],
 "project_feedback": "feedback on the projects already on the resume",
 "project_suggestions": [{{"title": "...", "why": "which gaps it closes", "stack": ["..."],
   "scope": "what to build, in 2 sentences", "resume_bullet": "example bullet with a metric placeholder"}}]}}
Give 2-3 project suggestions. Be specific; no generic advice."""
    try:
        return llm.complete_json("You are a senior engineer and career coach. Return only JSON.", prompt, 2500)
    except Exception:
        return {
            "summary": f"Your resume matches {match}% of the skills expected for {role}.",
            "company_focus": [],
            "project_feedback": "",
            "project_suggestions": [],
            "degraded": True,
        }
