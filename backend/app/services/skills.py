import json
import re
from functools import lru_cache
from pathlib import Path

ALIASES = {
    "js": "javascript", "ts": "typescript", "reactjs": "react", "react.js": "react",
    "nodejs": "node.js", "node": "node.js", "postgres": "postgresql", "k8s": "kubernetes",
    "ml": "machine learning", "dl": "deep learning", "sklearn": "scikit-learn",
    "dsa": "data structures", "restful": "rest", "cicd": "ci/cd", "tf": "tensorflow",
}
_REVERSE: dict[str, list[str]] = {}
for _alias, _canon in ALIASES.items():
    _REVERSE.setdefault(_canon, []).append(_alias)


@lru_cache
def role_catalog() -> dict:
    return json.loads((Path(__file__).parent.parent / "data" / "roles.json").read_text())


def count_skill(text: str, skill: str) -> int:
    low = text.lower()
    total = 0
    for term in [skill, *_REVERSE.get(skill, [])]:
        total += len(re.findall(r"(?<![a-z0-9])" + re.escape(term) + r"(?![a-z0-9])", low))
    return total


def get_role_profile(role: str, llm=None) -> dict:
    catalog = role_catalog()
    for name, prof in catalog.items():
        if name.lower() == role.lower():
            return prof
    if llm is None:
        return catalog["Software Engineer"]
    try:  # custom role: derive a profile with the same shape as the catalog
        out = llm.complete_json(
            "You are a hiring expert. Return only JSON.",
            f'List the skills required for the role "{role}". Return {{"core": [8-10 lowercase skills], '
            f'"nice": [6-8 lowercase skills]}}.',
        )
        return {"core": out["core"][:10], "nice": out["nice"][:8]}
    except Exception:
        return catalog["Software Engineer"]
