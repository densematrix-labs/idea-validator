"""LLM service for AI-powered idea validation."""
import json
import httpx
from typing import Optional
from app.config import get_settings

settings = get_settings()


VALIDATION_PROMPT = """You are an expert startup analyst and venture capitalist. Analyze the following startup idea and provide a comprehensive validation report.

**Startup Idea:**
Title: {title}
Description: {description}

**Provide your analysis in the following JSON format:**
{{
  "overall_score": <integer 0-100>,
  "market_analysis": {{
    "tam": "<Total Addressable Market estimate>",
    "sam": "<Serviceable Available Market estimate>",
    "som": "<Serviceable Obtainable Market estimate>",
    "market_trends": ["<trend 1>", "<trend 2>", ...],
    "target_customers": "<description of ideal customers>",
    "score": <integer 0-100>
  }},
  "competition_analysis": {{
    "direct_competitors": ["<competitor 1>", "<competitor 2>", ...],
    "indirect_competitors": ["<competitor 1>", "<competitor 2>", ...],
    "competitive_advantages": ["<advantage 1>", "<advantage 2>", ...],
    "barriers_to_entry": ["<barrier 1>", "<barrier 2>", ...],
    "score": <integer 0-100>
  }},
  "technical_feasibility": {{
    "technology_stack": ["<tech 1>", "<tech 2>", ...],
    "development_complexity": "<low/medium/high>",
    "time_to_mvp": "<estimate in weeks/months>",
    "key_technical_challenges": ["<challenge 1>", "<challenge 2>", ...],
    "score": <integer 0-100>
  }},
  "business_model": {{
    "revenue_streams": ["<stream 1>", "<stream 2>", ...],
    "pricing_strategy": "<description>",
    "unit_economics": "<description>",
    "scalability": "<low/medium/high>",
    "score": <integer 0-100>
  }},
  "risks": {{
    "market_risks": ["<risk 1>", "<risk 2>", ...],
    "technical_risks": ["<risk 1>", "<risk 2>", ...],
    "financial_risks": ["<risk 1>", "<risk 2>", ...],
    "regulatory_risks": ["<risk 1>", "<risk 2>", ...],
    "overall_risk_level": "<low/medium/high>"
  }},
  "suggestions": {{
    "immediate_actions": ["<action 1>", "<action 2>", ...],
    "improvements": ["<improvement 1>", "<improvement 2>", ...],
    "pivot_ideas": ["<pivot 1>", "<pivot 2>", ...],
    "resources_needed": ["<resource 1>", "<resource 2>", ...]
  }},
  "summary": "<2-3 sentence executive summary of the validation>"
}}

Respond ONLY with valid JSON. Be specific, actionable, and data-driven in your analysis. Language: {language}"""


async def validate_idea(
    title: str,
    description: str,
    language: str = "en"
) -> dict:
    """
    Validate a startup idea using LLM.
    
    Args:
        title: The idea title
        description: Detailed description of the idea
        language: Language code for the response
        
    Returns:
        Validation report as dictionary
    """
    prompt = VALIDATION_PROMPT.format(
        title=title,
        description=description,
        language=language
    )
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.llm_proxy_url}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.llm_proxy_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 4000,
            }
        )
        response.raise_for_status()
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON from response
        # Handle potential markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        result = json.loads(content.strip())
        return result
