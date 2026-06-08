import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"


def _call_groq(prompt: str, max_tokens: int = 1024) -> str:
    """Call Groq API and return the text response."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set in backend/.env")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    res = requests.post(GROQ_API_URL, headers=headers, json=body, timeout=30)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


def ask_about_data(question: str, dataset_summary: str) -> str:
    prompt = f"""You are Rabbitt, an expert AI business analyst embedded in the Talking Rabbitt BI Dashboard.

You have access to the following dataset summary:

{dataset_summary}

A user has asked the following question about this dataset:
"{question}"

Provide a concise, insightful, data-driven answer. Use specific numbers from the summary where possible.
Keep your response under 200 words. Be professional but approachable.
"""
    return _call_groq(prompt)


def generate_recommendations(dataset_summary: str) -> list[dict]:
    prompt = f"""You are Rabbitt, a senior business intelligence consultant.

Analyze this dataset summary and generate exactly 4 actionable business recommendations:

{dataset_summary}

Respond ONLY with a valid JSON array (no markdown, no explanation outside the JSON) in this exact format:
[
  {{
    "title": "Short action title",
    "description": "2-3 sentence business recommendation with specific numbers if available",
    "priority": "high",
    "category": "revenue"
  }}
]

Priority must be one of: high, medium, low
Category must be one of: revenue, operations, risk, growth, customer
"""
    text = _call_groq(prompt, max_tokens=1024).strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return [{
            "title": "Data Quality Improvement",
            "description": "Review and clean missing values to improve analysis accuracy.",
            "priority": "high",
            "category": "operations",
        }]


def generate_insight_summary(dataset_summary: str) -> str:
    prompt = f"""You are Rabbitt, a business intelligence AI.

Given this data summary, write a 3-sentence executive overview paragraph for a business dashboard.
Be specific, data-driven, and highlight the most important finding.

Dataset Summary:
{dataset_summary}

Respond with just the paragraph, no headers or extra formatting.
"""
    return _call_groq(prompt)
