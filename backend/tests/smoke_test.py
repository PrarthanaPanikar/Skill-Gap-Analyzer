"""Runs the scoring pipeline with a stub LLM - no Firebase or API keys needed."""
from app.services import ats, gaps, parser, roadmap
from app.services.skills import get_role_profile

RESUME = """Prarthana Sample
prarthana@example.com | +91 98765 43210

Summary
Final-year B.Tech student building web apps.

Skills
Python, Java, React, FastAPI, SQL, Git

Projects
- Built a traffic dashboard with React and FastAPI serving 2,000 requests per day
- Developed a REST API in Python with Postgres and reduced query time by 40%
- Designed a student portal using Java and SQL for 300 users

Experience
- Implemented CI pipeline with Git hooks for a 5 member team
- Worked on some tasks for the web team and helped with various things during the internship

Education
B.Tech in Computer Engineering, 2026, CGPA 8.4 across all semesters of the course work completed
""" + " filler" * 120


class StubLLM:
    def complete_json(self, system, prompt, max_tokens=0):
        if "learning roadmap" in prompt:
            return {"phases": [{"title": "P1", "weeks": "1-2", "goals": ["docker"], "resources": [], "milestone": "m"}]}
        if "Return {\"score\"" in prompt:
            return {"score": 72, "reason": "Solid fundamentals, light on deployment."}
        return {"summary": "ok", "company_focus": [], "project_feedback": "", "project_suggestions": []}


sections = parser.split_sections(RESUME)
profile = get_role_profile("Backend Developer")
items, match = gaps.skill_gaps(RESUME, profile)
result = ats.score(RESUME, sections, profile, StubLLM(), "Backend Developer")
print("sections:", sorted(sections))
print("match:", match, "| ats:", result["total"], {k: v["score"] for k, v in result["breakdown"].items()})
print("missing:", [i["skill"] for i in items if i["status"] == "missing"])
print("tips:", result["tips"])
print("roadmap phases:", len(roadmap.build_roadmap(StubLLM(), "Backend Developer", [], items, match, 12)["phases"]))
print("fallback roadmap:", len(roadmap._fallback(items, 12)["phases"]), "phases")
print("custom role w/o llm ->", get_role_profile("Quantum Dev")["core"][:2])
