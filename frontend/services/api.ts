import { ReviewData } from '@/types/review';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // Defaults to true for now
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Built-in fallback mock data
const mockReviewData: ReviewData = {
  prNumber: 42,
  prTitle: "feat(auth): add JWT token refresh rotation and rate limiting",
  branch: "feature/auth-hardening",
  securityScore: 84,
  summary: "NVIDIA Nemotron-3 analyzed pull request #42 and detected 1 critical security vulnerability regarding hardcoded secrets and 1 performance bottleneck in middleware.",
  findingsCount: {
    critical: 1,
    high: 0,
    medium: 2,
    low: 1,
    total: 4
  },
  findings: [
    {
      id: 1,
      filePath: "backend/auth/jwt_handler.py",
      lineNumber: 34,
      category: "security",
      severity: "Critical",
      title: "Hardcoded fallback secret key detected",
      explanation: "Using a fallback string like 'secret123' if the environment variable is missing compromises token signing security.",
      recommendedFix: "Raise a configuration error instead of falling back to a default static string."
    },
    {
      id: 2,
      filePath: "backend/auth/middleware.py",
      lineNumber: 88,
      category: "performance",
      severity: "Medium",
      title: "Synchronous database query inside async rate limiter",
      explanation: "Blocking IO call in an asynchronous middleware can degrade throughput under heavy request load.",
      recommendedFix: "Use an asynchronous database driver call (e.g., asyncpg) for rate limit checks."
    },
    {
      id: 3,
      filePath: "backend/api/users.py",
      lineNumber: 112,
      category: "bug",
      severity: "Medium",
      title: "Potential unhandled null user reference",
      explanation: "User object can be None if lookup fails, leading to an AttributeError when accessing `.email`.",
      recommendedFix: "Add a Guard clause: `if not user: raise HTTPException(404)`."
    }
  ],
  history: [
    { id: "PR-42", repo: "org/repoguard-ai", title: "feat(auth): add JWT token refresh", score: 84, date: "10 mins ago", status: "Changes Requested" },
    { id: "PR-41", repo: "org/repoguard-ai", title: "fix(db): connection pool timeout config", score: 98, date: "2 hours ago", status: "Passed" },
    { id: "PR-38", repo: "org/pricepilot-ai", title: "refactor(scraper): optimize async workers", score: 92, date: "1 day ago", status: "Passed" },
  ]
};

export async function fetchReviewData(prNumber: number = 42): Promise<ReviewData> {
  if (USE_MOCK) {
    // Simulate slight network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockReviewData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${prNumber}`);
    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Failed to connect to FastAPI backend, falling back to mock data:", error);
    return mockReviewData;
  }
}

export async function triggerAnalysis(repo: string, prNumber: number): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true, message: "Analysis completed via mock engine." };
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo, pr_number: prNumber })
  });
  return response.json();
}