# backend/github_service.py
import re
import httpx
from fastapi import HTTPException

# Regex strictly matching public PR URLs: https://github.com/{owner}/{repo}/pull/{number}
GITHUB_PR_REGEX = re.compile(
    r"^https://github\.com/([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)/pull/(\d+)$"
)

def parse_and_validate_pr_url(url: str) -> tuple[str, str, int]:
    if not url or not isinstance(url, str):
        raise HTTPException(status_code=400, detail="A valid GitHub pull request URL is required.")
    
    cleaned_url = url.strip()
    match = GITHUB_PR_REGEX.match(cleaned_url)
    if not match:
        raise HTTPException(
            status_code=400, 
            detail="Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123"
        )
    
    owner, repo, pr_str = match.groups()
    try:
        pr_number = int(pr_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pull request number.")
        
    return owner, repo, pr_number

async def fetch_public_pr_data(url: str) -> dict:
    owner, repo, pr_number = parse_and_validate_pr_url(url)
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Fetch PR metadata
        pr_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}", headers=headers)
        
        if pr_res.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Public pull request #{pr_number} not found in {owner}/{repo}.")
        elif pr_res.status_code in [403, 429]:
            raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded. Please try again shortly.")
        elif pr_res.status_code != 200:
            raise HTTPException(status_code=pr_res.status_code, detail="Failed to fetch pull request from GitHub API.")
            
        pr_data = pr_res.json()
        
        # Fetch PR changed files & diffs
        files_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files", headers=headers)
        files_data = files_res.json() if files_res.status_code == 200 else []
        
        changed_files = []
        diff_snippets = []
        
        for f in files_data:
            filename = f.get("filename")
            status = f.get("status")
            patch = f.get("patch", "")
            
            changed_files.append({
                "filename": filename,
                "status": status,
                "additions": f.get("additions", 0),
                "deletions": f.get("deletions", 0),
                "patch": patch if patch else "[Binary or large file patch omitted]"
            })
            
            if patch:
                truncated_patch = patch[:4000] if len(patch) > 4000 else patch
                diff_snippets.append(f"File: {filename} ({status})\n--- Diff ---\n{truncated_patch}")
                
        combined_context = "\n\n".join(diff_snippets) if diff_snippets else "No code diff patches found for this PR."
        if len(combined_context) > 25000:
            combined_context = combined_context[:25000] + "\n\n[Context truncated due to size limit]"

        return {
            "owner": owner,
            "repo": repo,
            "prNumber": pr_data["number"],
            "prTitle": pr_data["title"],
            "branch": pr_data["head"]["ref"],
            "author": pr_data["user"]["login"],
            "html_url": pr_data["html_url"],
            "changedFilesCount": len(changed_files),
            "changedFiles": changed_files,
            "codeContext": combined_context
        }