'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  GitPullRequest, 
  Terminal, 
  RefreshCw, 
  Cpu, 
  LayoutDashboard, 
  History, 
  Settings, 
  Play, 
  FileText, 
  ShieldCheck,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  Server
} from 'lucide-react';
import DiffViewer from '@/components/DiffViewer';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'workspace' | 'findings' | 'history'>('overview');
  const [selectedRepo, setSelectedRepo] = useState('org/repoguard-ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  // Workspace code input state
  const [inputCode, setInputCode] = useState(`def get_jwt_secret():
    # Dangerous static fallback key
    return os.getenv("JWT_SECRET", "secret123")`);

  const [fixedCode, setFixedCode] = useState(`def get_jwt_secret():
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET environment variable is not configured!")
    return secret`);

  // Mock review data
  const reviewData = {
    prNumber: 42,
    prTitle: "feat(auth): add JWT token refresh rotation and rate limiting",
    branch: "feature/auth-hardening",
    securityScore: 84,
    summary: "NVIDIA Nemotron-3 analyzed the pull request and detected 1 critical security vulnerability regarding hardcoded secrets and 1 performance bottleneck in middleware.",
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
      { id: "PR-42", repo: "org/repoguard-ai", title: "feat(auth): add JWT token refresh", score: 84, date: "10 mins ago", status: "Failed Checks" },
      { id: "PR-41", repo: "org/repoguard-ai", title: "fix(db): connection pool timeout config", score: 98, date: "2 hours ago", status: "Passed" },
      { id: "PR-38", repo: "org/pricepilot-ai", title: "refactor(scraper): optimize async workers", score: 92, date: "1 day ago", status: "Passed" },
    ]
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
      setActiveTab('workspace');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans selection:bg-violet-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
          {/* Logo Brand */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-200">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/10 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                RepoGuard <span className="text-violet-600 font-mono text-xs">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500">Nemotron Security Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'overview' 
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'workspace' 
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code Review Workspace</span>
            </button>

            <button 
              onClick={() => setActiveTab('findings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'findings' 
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Security Findings</span>
              <span className="ml-auto bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">
                {reviewData.findingsCount.critical}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'history' 
                  ? 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Review History</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer / Connection Status */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Server className="w-3.5 h-3.5 text-amber-500" /> Backend Status
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                Demo Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Using local mock data. Connect sister's FastAPI backend for live GitHub webhooks.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Header Bar */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-500 font-mono">Repository:</span>
              <select 
                value={selectedRepo} 
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-violet-600 font-mono"
              >
                <option value="org/repoguard-ai">org/repoguard-ai</option>
                <option value="org/pricepilot-ai">org/pricepilot-ai</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-violet-600/10 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Nemotron Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Review</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Tab Views */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-violet-50 via-indigo-50/50 to-transparent border border-violet-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet-100 text-violet-700 border border-violet-200 font-medium">
                      Nebius x NVIDIA Hackathon MVP
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Branch: {reviewData.branch}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{reviewData.prTitle}</h2>
                  <p className="text-sm text-slate-600 max-w-2xl">{reviewData.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('workspace')}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 shadow-xs"
                  >
                    <span>Inspect Code Diff</span>
                    <ChevronRight className="w-4 h-4 text-violet-600" />
                  </button>
                </div>
              </div>

              {/* Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Security Score Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-violet-300 transition shadow-xs">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-violet-50 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Security Score</span>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-4xl font-extrabold text-violet-600 font-mono">{reviewData.securityScore}</span>
                      <span className="text-slate-400 text-sm">/ 100</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full" style={{ width: `${reviewData.securityScore}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 block">Based on severity weights</span>
                  </div>
                </div>

                {/* Critical Issues Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-300 transition shadow-xs">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Critical Issues</span>
                    <div className="mt-3 text-4xl font-extrabold text-rose-600 font-mono">
                      {reviewData.findingsCount.critical}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                    <ShieldAlert className="w-4 h-4" /> Requires immediate fix
                  </div>
                </div>

                {/* Warnings Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-300 transition shadow-xs">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Warnings & Style</span>
                    <div className="mt-3 text-4xl font-extrabold text-amber-600 font-mono">
                      {reviewData.findingsCount.medium + reviewData.findingsCount.low}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                    <AlertTriangle className="w-4 h-4" /> Performance & Best Practices
                  </div>
                </div>

                {/* Files Reviewed Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-violet-300 transition shadow-xs">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Files Analyzed</span>
                    <div className="mt-3 text-4xl font-extrabold text-slate-900 font-mono">
                      2
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <FileText className="w-4 h-4 text-violet-600" /> Python & FastAPI modules
                  </div>
                </div>

              </div>

              {/* Quick Summary of Findings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider font-mono">Top Security Findings</h3>
                  <button onClick={() => setActiveTab('findings')} className="text-xs text-violet-600 hover:underline font-medium">
                    View all findings →
                  </button>
                </div>

                <div className="space-y-3">
                  {reviewData.findings.map((f) => (
                    <div key={f.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          f.severity === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {f.severity}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{f.title}</h4>
                          <span className="text-xs font-mono text-slate-500">{f.filePath}:{f.lineNumber}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
                        {f.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CODE REVIEW WORKSPACE (Monaco Diff Viewer) */}
          {activeTab === 'workspace' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Interactive Code Review Workspace</h2>
                  <p className="text-xs text-slate-500">Comparing original pull request code with NVIDIA Nemotron's AI-suggested security fixes.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    File: <strong className="text-violet-600">backend/auth/jwt_handler.py</strong>
                  </span>
                </div>
              </div>

              {/* Embedded DiffViewer Component */}
              <DiffViewer 
                originalCode={inputCode}
                modifiedCode={fixedCode}
                language="python"
                filePath="backend/auth/jwt_handler.py"
              />

              {/* AI Explanation Callout */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-violet-700 flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4" /> Nemotron AI Recommendation
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  The original code implemented a static fallback secret <code className="bg-white border border-slate-200 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs">"secret123"</code> which presents a critical security vulnerability if deployed to production without environment configuration. The AI suggestion enforces strict environment checks and raises an immediate configuration exception.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY FINDINGS */}
          {activeTab === 'findings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Detailed Security & Quality Findings</h2>
                <p className="text-xs text-slate-500">Comprehensive breakdown of vulnerabilities detected in PR #42.</p>
              </div>

              <div className="space-y-4">
                {reviewData.findings.map((f) => (
                  <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold ${
                          f.severity === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                          <Code className="w-3.5 h-3.5 text-violet-600" /> {f.filePath}:{f.lineNumber}
                        </span>
                      </div>
                      <span className="text-xs font-mono uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {f.category}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.explanation}</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-violet-900 space-y-1">
                      <span className="text-slate-500 font-sans font-semibold block mb-1">Recommended Fix:</span>
                      <p className="text-slate-800">{f.recommendedFix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEW HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review History & Logs</h2>
                <p className="text-xs text-slate-500">Recent automated pull request code reviews across connected repositories.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-mono text-slate-500 bg-slate-50">
                      <th className="p-4">Pull Request</th>
                      <th className="p-4">Repository</th>
                      <th className="p-4">Security Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {reviewData.history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-violet-600" />
                          <div>
                            <div>{item.title}</div>
                            <span className="text-xs text-slate-400 font-mono">{item.id}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500">{item.repo}</td>
                        <td className="p-4 font-mono font-bold text-violet-600">{item.score}/100</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400 font-mono">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}