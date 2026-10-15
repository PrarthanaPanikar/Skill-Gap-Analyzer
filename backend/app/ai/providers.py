"""Minimal provider-agnostic LLM interface.
If SkillGap AI already has a provider factory, replace get_llm() with an adapter
exposing the same single method: complete_json(system, prompt) -> dict."""
import json
import re

from app.config import settings


def extract_json(text: str) -> dict:
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Model did not return JSON")
    return json.loads(text[start : end + 1])


class AnthropicLLM:
    def __init__(self):
        import anthropic

        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def complete_json(self, system: str, prompt: str, max_tokens: int = 2500) -> dict:
        msg = self.client.messages.create(
            model=settings.model_name,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return extract_json("".join(b.text for b in msg.content if b.type == "text"))


class OpenAILLM:
    def __init__(self):
        from openai import OpenAI

        self.client = OpenAI(api_key=settings.openai_api_key)

    def complete_json(self, system: str, prompt: str, max_tokens: int = 2500) -> dict:
        r = self.client.chat.completions.create(
            model=settings.model_name,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        )
        return extract_json(r.choices[0].message.content)


_PROVIDERS = {"anthropic": AnthropicLLM, "openai": OpenAILLM}


def get_llm():
    return _PROVIDERS[settings.ai_provider]()
