def _fallback(items: list[dict], weeks: int) -> dict:
    todo = [i["skill"] for i in items if i["status"] != "strong"]
    per = max(1, -(-len(todo) // max(1, weeks // 2)))
    phases = []
    for n, start in enumerate(range(0, len(todo), per)):
        chunk = todo[start : start + per]
        phases.append({
            "title": f"Phase {n + 1}: {', '.join(chunk[:2])}", "weeks": "2",
            "goals": chunk, "resources": [], "milestone": f"Build a small project using {chunk[0]}.",
        })
    return {"timeline_weeks": weeks, "phases": phases, "degraded": True}


def build_roadmap(llm, role: str, companies: list[str], items: list[dict], match: int, weeks: int) -> dict:
    gaps = [f'{i["skill"]} ({i["status"]}, {i["tier"]})' for i in items if i["status"] != "strong"]
    prompt = f"""Create a {weeks}-week learning roadmap for a candidate targeting {role}
at {", ".join(companies) or "top tech companies"}. Current skill match: {match}%.
Gaps, highest priority first: {"; ".join(gaps)}.

Return JSON:
{{"timeline_weeks": {weeks},
 "phases": [{{"title": "...", "weeks": "e.g. 1-2", "goals": ["..."],
   "resources": ["named, real, free-if-possible resources"], "milestone": "a concrete project or checkpoint"}}]}}
Order phases by priority, put core skills before nice-to-haves, and end with a portfolio project plus interview prep."""
    try:
        out = llm.complete_json("You are a senior engineer mentoring a student. Return only JSON.", prompt, 3000)
        if out.get("phases"):
            return out
    except Exception:
        pass
    return _fallback(items, weeks)
