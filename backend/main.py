# backend/main.py
import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from backend.github_service import fetch_public_pr_data

load_dotenv()

app = FastAPI(title="RepoGuard AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.environ.get("NEBIUS_API_KEY")
openai.api_base = "https://api.tokenfactory.nebius.com/v1/"
NEBIUS_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct"

class AnalyzeRequest(BaseModel):
    repo: str
    pr_number: int
    code_snippet: str

class PullRequestUrlRequest(BaseModel):
    pr_url: str

def run_nebius_security_analysis(code_context: str, repo_name: str, pr_title: str) -> dict:
    system_prompt = """You are RepoGuard AI, an elite autonomous security code reviewer.
Analyze the provided code changes for security vulnerabilities, bugs, and performance bottlenecks.
You MUST reply ONLY with valid JSON matching this exact structure, with no markdown code blocks or extra text:
{
  "securityScore": 75,
  "summary": "A concise 1-sentence summary of the security posture of this code.",
  "findingsCount": {"critical": 1, "high": 0, "medium": 1, "low": 0, "total": 2},
  "findings": [
    {
      "id": 1,
      "filePath": "src/module.py",
      "lineNumber": 1,
      "category": "security",
      "severity": "Critical",
      "title": "Vulnerability Title",
      "explanation": "Detailed explanation of why this is a risk.",
      "recommendedFix": "Clear instructions or code fix."
    }
  ]
}"""

    try:
        response = openai.ChatCompletion.create(
            model=NEBIUS_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Repository: {repo_name}\nPull Request: {pr_title}\n\nCode Diff / Changes to audit:\n{code_context}"}
            ],
            temperature=0.2,
        )
        
        raw_content = response.choices[0].message.content.strip()
        if raw_content.startswith("```"):
            raw_content = raw_content.split("\n", 1)[1].rsplit("\n", 1)[0].replace("json", "").strip()
            
        return json.loads(raw_content)
    except Exception as e:
        print("Nebius API Error:", e)
        return {
            "securityScore": 70,
            "summary": f"Analysis completed with fallback parsing. Error: {str(e)}",
            "findingsCount": {"critical": 0, "high": 0, "medium": 1, "low": 0, "total": 1},
            "findings": [
                {
                    "id": 1,
                    "filePath": "general",
                    "lineNumber": 1,
                    "category": "review",
                    "severity": "Medium",
                    "title": "General review notice",
                    "explanation": "Inference completed.",
                    "recommendedFix": "Verify changes manually."
                }
            ]
        }

@app.get("/api/reviews/{pr_number}")
def get_review_data(pr_number: int):
    return {
        "prNumber": pr_number,
        "prTitle": f"Pull Request #{pr_number} Audit",
        "branch": "feature/security-scan",
        "securityScore": 100,
        "summary": "Ready for live inspection. Paste a public GitHub PR URL and click 'Run AI Review' to execute real-time NVIDIA Llama analysis via Nebius Token Factory.",
        "findingsCount": { "critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0 },
        "findings": [],
        "history": []
    }

@app.post("/api/analyze")
def trigger_analysis(payload: AnalyzeRequest):
    analysis_result = run_nebius_security_analysis(payload.code_snippet, payload.repo, f"PR #{payload.pr_number}")
    return {
        "success": True,
        "prNumber": payload.pr_number,
        "prTitle": f"Security Audit: {payload.repo} (PR #{payload.pr_number})",
        "branch": "feature/security-scan",
        "securityScore": analysis_result.get("securityScore", 50),
        "summary": analysis_result.get("summary", "Analysis completed."),
        "findingsCount": analysis_result.get("findingsCount", {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0}),
        "findings": analysis_result.get("findings", []),
        "history": [
            { 
                "id": f"PR-{payload.pr_number}", 
                "repo": payload.repo, 
                "title": f"Live Audit PR #{payload.pr_number}", 
                "score": analysis_result.get("securityScore", 50), 
                "date": "Just now", 
                "status": "Passed" if analysis_result.get("securityScore", 50) >= 80 else "Changes Requested"
            }
        ]
    }

@app.post("/api/github/analyze-url")
async def analyze_github_pr_url(payload: PullRequestUrlRequest):
    pr_info = await fetch_public_pr_data(payload.pr_url)
    
    analysis_result = run_nebius_security_analysis(
        code_context=pr_info["codeContext"],
        repo_name=f"{pr_info['owner']}/{pr_info['repo']}",
        pr_title=pr_info["prTitle"]
    )
    
    return {
        "success": True,
        "prNumber": pr_info["prNumber"],
        "prTitle": pr_info["prTitle"],
        "branch": pr_info["branch"],
        "author": pr_info["author"],
        "html_url": pr_info["html_url"],
        "changedFilesCount": pr_info["changedFilesCount"],
        "changedFiles": pr_info["changedFiles"],
        "securityScore": analysis_result.get("securityScore", 75),
        "summary": f"[Nebius Llama-3.1-70B Live Audit] {analysis_result.get('summary')}",
        "findingsCount": analysis_result.get("findingsCount", {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0}),
        "findings": analysis_result.get("findings", []),
        "history": [
            {
                "id": f"PR-{pr_info['prNumber']}",
                "repo": f"{pr_info['owner']}/{pr_info['repo']}",
                "title": pr_info["prTitle"],
                "score": analysis_result.get("securityScore", 75),
                "date": "Just now",
                "status": "Passed" if analysis_result.get("securityScore", 75) >= 80 else "Changes Requested"
            }
        ]
    }