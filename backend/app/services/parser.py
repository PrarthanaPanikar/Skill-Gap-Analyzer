import io

SECTION_ALIASES = {
    "summary": ["summary", "objective", "profile", "about me", "professional summary"],
    "skills": ["skills", "technical skills", "core competencies", "tech stack"],
    "experience": ["experience", "work experience", "professional experience", "internships", "internship"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "education": ["education", "academics", "academic background"],
    "certifications": ["certifications", "certificates", "achievements", "awards"],
}
_LOOKUP = {a: k for k, v in SECTION_ALIASES.items() for a in v}


def extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        import pdfplumber

        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join((p.extract_text() or "") for p in pdf.pages)
    elif name.endswith(".docx"):
        from docx import Document

        text = "\n".join(p.text for p in Document(io.BytesIO(data)).paragraphs)
    else:
        raise ValueError("Upload a PDF or DOCX file.")
    if len(text.split()) < 40:
        raise ValueError(
            "We couldn't read text from this file. It may be a scanned image - "
            "export it as a text-based PDF or DOCX and try again. (ATS systems can't read scans either.)"
        )
    return text


def split_sections(text: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current = "header"
    for line in text.splitlines():
        key = _LOOKUP.get(line.strip().lower().rstrip(":"))
        if key:
            current = key
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(line)
    return {k: "\n".join(v).strip() for k, v in sections.items()}
