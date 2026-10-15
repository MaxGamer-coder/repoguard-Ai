# backend/main.py
import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.github_service import fetch_public_pr_data

load_dotenv()

app = FastAPI(title="RepoGuard AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEBIUS_API_KEY = os.environ.get("NEBIUS_API_KEY")
NEBIUS_API_URL = "https://api.tokenfactory.nebius.com/v1/chat/completions"
NEBIUS_MODEL = "google/gemma-3-27b-it"

class AnalyzeRequest(BaseModel):
    repo: str
    pr_number: int
    code_snippet: str

class PullRequestUrlRequest(BaseModel):
    pr_url: str

@app.on_event("startup")
async def startup_event():
    """Automatically fetch and print available model IDs from Nebius on startup."""
    if not NEBIUS_API_KEY:
        print("CRITICAL ERROR: NEBIUS_API_KEY is not set in environment variables.")
        return
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Authorization": f"Bearer {NEBIUS_API_KEY}"}
            print("-> Querying Nebius Token Factory for available models...")
            response = await client.get("https://api.tokenfactory.nebius.com/v1/models", headers=headers)
            
            if response.status_code == 200:
                models_data = response.json().get("data", [])
                print("\n==================================================")
                print(" SUCCESS: Connected to Nebius Token Factory!")
                print(" AVAILABLE MODEL IDs FOR YOUR ACCOUNT:")
                for m in models_data:
                    print(f"   - {m.get('id')}")
                print("==================================================\n")
            else:
                print(f"-> Failed to fetch models list [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"-> Startup model check exception: {e}")

async def run_nebius_security_analysis(code_context: str, repo_name: str, pr_title: str) -> dict:
    if not NEBIUS_API_KEY:
        print("CRITICAL ERROR: NEBIUS_API_KEY is not set in environment variables.")
        raise HTTPException(status_code=500, detail="NEBIUS_API_KEY is missing in backend environment.")

    system_prompt = (
        "You are RepoGuard AI, an elite autonomous security code reviewer. "
        "Analyze the provided code changes for security vulnerabilities, bugs, and performance bottlenecks. "
        "You MUST reply ONLY with valid JSON matching this exact structure, with no markdown code blocks or extra text:\n"
        "{\n"
        '  "securityScore": <integer 0 to 100>,\n'
        '  "summary": "<concise 1-sentence summary>",\n'
        '  "findingsCount": {"critical": <int>, "high": <int>, "medium": <int>, "low": <int>, "total": <int>},\n'
        '  "findings": [\n'
        '    {\n'
        '      "id": 1,\n'
        '      "filePath": "<filename>",\n'
        '      "lineNumber": 1,\n'
        '      "category": "security",\n'
        '      "severity": "<Critical|High|Medium|Low>",\n'
        '      "title": "<vulnerability title>",\n'
        '      "explanation": "<detailed explanation>",\n'
        '      "recommendedFix": "<clear fix instructions>"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    user_prompt = f"Repository: {repo_name}\nPull Request: {pr_title}\n\nCode Diff / Changes to audit:\n{code_context}"

    payload = {
        "model": NEBIUS_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {NEBIUS_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        print(f"-> Sending PR diff to Nebius Token Factory ({NEBIUS_MODEL})...")
        response = await client.post(NEBIUS_API_URL, json=payload, headers=headers)
        
        if response.status_code != 200:
            print(f"-> Nebius API Error [{response.status_code}]: {response.text}")
            raise HTTPException(status_code=500, detail=f"Nebius API error: {response.text}")

        res_data = response.json()
        raw_content = res_data["choices"][0]["message"]["content"].strip()
        
        if raw_content.startswith("```"):
            raw_content = raw_content.split("\n", 1)[1].rsplit("\n", 1)[0].replace("json", "").strip()
            
        try:
            return json.loads(raw_content)
        except json.JSONDecodeError as e:
            print(f"-> JSON Decode Error from Nebius response: {e}\nRaw content: {raw_content}")
            raise HTTPException(status_code=500, detail=f"Failed to parse LLM JSON response: {str(e)}")

@app.get("/api/reviews/{pr_number}")
def get_review_data(pr_number: int):
    return {
        "prNumber": pr_number,
        "prTitle": f"Pull Request #{pr_number} Audit",
        "branch": "feature/security-scan",
        "securityScore": 100,
        "summary": "Ready for live inspection. Paste a public GitHub PR URL and click 'Run AI Review' to execute real-time security analysis via Nebius Token Factory.",
        "findingsCount": { "critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0 },
        "findings": [],
        "history": []
    }

@app.post("/api/analyze")
async def trigger_analysis(payload: AnalyzeRequest):
    analysis_result = await run_nebius_security_analysis(payload.code_snippet, payload.repo, f"PR #{payload.pr_number}")
    score = analysis_result.get("securityScore", 50)
    return {
        "success": True,
        "prNumber": payload.pr_number,
        "prTitle": f"Security Audit: {payload.repo} (PR #{payload.pr_number})",
        "branch": "feature/security-scan",
        "securityScore": score,
        "summary": analysis_result.get("summary", "Analysis completed."),
        "findingsCount": analysis_result.get("findingsCount", {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0}),
        "findings": analysis_result.get("findings", []),
        "history": [
            { 
                "id": f"PR-{payload.pr_number}", 
                "repo": payload.repo, 
                "title": f"Live Audit PR #{payload.pr_number}", 
                "score": score, 
                "date": "Just now", 
                "status": "Passed" if score >= 80 else "Changes Requested"
            }
        ]
    }

@app.post("/api/github/analyze-url")
async def analyze_github_pr_url(payload: PullRequestUrlRequest):
    pr_info = await fetch_public_pr_data(payload.pr_url)
    
    analysis_result = await run_nebius_security_analysis(
        code_context=pr_info["codeContext"],
        repo_name=f"{pr_info['owner']}/{pr_info['repo']}",
        pr_title=pr_info["prTitle"]
    )
    
    score = analysis_result.get("securityScore", 75)
    
    return {
        "success": True,
        "prNumber": pr_info["prNumber"],
        "prTitle": pr_info["prTitle"],
        "branch": pr_info["branch"],
        "author": pr_info["author"],
        "html_url": pr_info["html_url"],
        "changedFilesCount": pr_info["changedFilesCount"],
        "changedFiles": pr_info["changedFiles"],
        "securityScore": score,
        "summary": f"[Nebius Token Factory Live Audit] {analysis_result.get('summary')}",
        "findingsCount": analysis_result.get("findingsCount", {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0}),
        "findings": analysis_result.get("findings", []),
        "history": [
            {
                "id": f"PR-{pr_info['prNumber']}",
                "repo": f"{pr_info['owner']}/{pr_info['repo']}",
                "title": pr_info["prTitle"],
                "score": score,
                "date": "Just now",
                "status": "Passed" if score >= 80 else "Changes Requested"
            }
        ]
    }