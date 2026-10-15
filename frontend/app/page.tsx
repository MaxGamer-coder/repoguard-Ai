'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  GitPullRequest, 
  Terminal, 
  RefreshCw, 
  LayoutDashboard, 
  History, 
  Settings, 
  FileText, 
  ShieldCheck,
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

  // Live review state initialized with fallback skeleton
  const [reviewData, setReviewData] = useState({
    prNumber: 42,
    prTitle: "Loading PR details from FastAPI backend...",
    branch: "feature/auth-hardening",
    securityScore: 0,
    summary: "Connecting to Nebius Token Factory & NVIDIA open infrastructure...",
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
    findings: [],
    history: []
  });

  // Workspace code input state
  const [inputCode, setInputCode] = useState(`def get_jwt_secret():
    # Dangerous static fallback key
    return os.getenv("JWT_SECRET", "secret123")`);

  const [fixedCode, setFixedCode] = useState(`def get_jwt_secret():
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET environment variable is not configured!")
    return secret`);

  // Fetch live review data from FastAPI backend on mount
  useEffect(() => {
    async function fetchReviewData() {
      try {
        const res = await fetch('http://localhost:8000/api/reviews/42');
        if (res.ok) {
          const data = await res.json();
          setReviewData(data);
        }
      } catch (err) {
        console.error("Failed to fetch from FastAPI backend, using fallback data.", err);
      }
    }
    fetchReviewData();
  }, []);

  // Trigger live AI analysis via FastAPI -> Nebius Token Factory / NVIDIA Llama
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: selectedRepo,
          pr_number: reviewData.prNumber
        })
      });
      const data = await res.json();
      console.log("Nebius AI Analysis Response:", data);
    } catch (err) {
      console.error("Failed to run live AI analysis:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
      setActiveTab('workspace');
    }
  };

  return (
    <div className="min-h-screen bg-[#1D211E] text-[#E4E5DB] flex flex-col font-sans selection:bg-[#A3B18A]/30 selection:text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Load IBM Plex Mono for code and technical metadata */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        
        code, pre, .font-mono {
          font-family: 'IBM Plex Mono', monospace !important;
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="bg-[#292E29] border-b border-[#414940] px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#A3B18A]" />
            <span className="font-semibold text-sm text-[#F0F1EA] tracking-tight">RepoGuard AI</span>
          </div>
          <span className="text-[#A6ADA2]">/</span>
          <div className="flex items-center space-x-2 bg-[#1D211E] border border-[#414940] rounded px-2.5 py-1 text-xs font-mono">
            <span className="text-[#A6ADA2]">repo:</span>
            <select 
              value={selectedRepo} 
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="bg-transparent text-[#F0F1EA] focus:outline-none cursor-pointer"
            >
              <option value="org/repoguard-ai" className="bg-[#292E29]">org/repoguard-ai</option>
              <option value="org/pricepilot-ai" className="bg-[#292E29]">org/pricepilot-ai</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#A3B18A]/15 text-[#A3B18A] border border-[#A3B18A]/30">
            FastAPI Live Connected
          </span>
          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-[#A3B18A] hover:bg-[#92A079] text-[#1B1E1C] font-semibold px-3.5 py-1.5 rounded text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running NVIDIA Model...</span>
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

      {/* PR Subheader Navigation */}
      <div className="bg-[#292E29] border-b border-[#414940] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#B5BCB0]">
              <span className="bg-[#A3B18A]/15 text-[#B8C4A2] border border-[#A3B18A]/30 px-2 py-0.5 rounded font-medium">
                PR #{reviewData.prNumber}
              </span>
              <span>branch: <strong className="text-[#F0F1EA]">{reviewData.branch}</strong></span>
            </div>
            <h1 className="text-sm font-medium text-[#F0F1EA]">{reviewData.prTitle}</h1>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center space-x-1 text-xs font-medium">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${
                activeTab === 'overview' 
                  ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' 
                  : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA] hover:bg-[#1D211E]/50'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${
                activeTab === 'workspace' 
                  ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' 
                  : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA] hover:bg-[#1D211E]/50'
              }`}
            >
              Files Changed & Diff
            </button>
            <button 
              onClick={() => setActiveTab('findings')}
              className={`px-3 py-2 rounded border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'findings' 
                  ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' 
                  : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA] hover:bg-[#1D211E]/50'
              }`}
            >
              <span>Security Findings</span>
              <span className="bg-[#F85149]/20 text-[#FF7B72] border border-[#F85149]/30 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {reviewData.findingsCount.critical}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${
                activeTab === 'history' 
                  ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' 
                  : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA] hover:bg-[#1D211E]/50'
              }`}
            >
              Review Logs
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Status Banner */}
            <div className="bg-[#292E29] border border-[#414940] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Changes requested
                  </span>
                  <span className="text-xs text-[#B5BCB0]">NVIDIA Llama-3.1-70B analyzed pull request via Nebius Token Factory</span>
                </div>
                <p className="text-xs text-[#B5BCB0] leading-relaxed">{reviewData.summary}</p>
              </div>
              <button 
                onClick={() => setActiveTab('workspace')}
                className="bg-[#1D211E] hover:bg-[#414940] text-[#F0F1EA] border border-[#414940] px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Code Diff</span>
                <ChevronRight className="w-4 h-4 text-[#B5BCB0]" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Security Score</span>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-semibold text-[#A3B18A] font-mono">{reviewData.securityScore}</span>
                  <span className="text-[#B5BCB0] text-xs">/ 100</span>
                </div>
                <div className="w-full bg-[#1D211E] h-1.5 rounded mt-3 overflow-hidden border border-[#414940]">
                  <div className="bg-[#A3B18A] h-full rounded" style={{ width: `${reviewData.securityScore}%` }} />
                </div>
              </div>

              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Critical Vulnerability</span>
                <div className="mt-2 text-2xl font-semibold text-[#FF7B72] font-mono">
                  {reviewData.findingsCount.critical}
                </div>
                <span className="text-xs text-[#FF7B72] mt-2 block font-medium">Hardcoded secret detected</span>
              </div>

              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Warnings & Style</span>
                <div className="mt-2 text-2xl font-semibold text-[#E6B450] font-mono">
                  {reviewData.findingsCount.medium + reviewData.findingsCount.low}
                </div>
                <span className="text-xs text-[#E6B450] mt-2 block font-medium">Performance & async issues</span>
              </div>

              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Files Reviewed</span>
                <div className="mt-2 text-2xl font-semibold text-[#F0F1EA] font-mono">
                  2
                </div>
                <span className="text-xs text-[#B5BCB0] mt-2 block font-medium">Python FastAPI modules</span>
              </div>

            </div>

            {/* Findings Preview */}
            <div className="bg-[#292E29] border border-[#414940] rounded overflow-hidden shadow-xs">
              <div className="bg-[#1D211E] px-4 py-3 border-b border-[#414940] flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-[#B5BCB0] font-mono">Detected Security Issues</h3>
                <button onClick={() => setActiveTab('findings')} className="text-xs text-[#A3B18A] hover:underline font-medium cursor-pointer">
                  View all findings →
                </button>
              </div>
              <div className="divide-y divide-[#414940]">
                {reviewData.findings && reviewData.findings.length > 0 ? (
                  reviewData.findings.map((f: any) => (
                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-[#1D211E]/40 transition">
                      <div className="flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          f.severity === 'Critical' ? 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30' : 'bg-[#D29922]/15 text-[#E6B450] border border-[#D29922]/30'
                        }`}>
                          {f.severity}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-[#F0F1EA]">{f.title}</h4>
                          <span className="text-[11px] font-mono text-[#B5BCB0]">{f.filePath}:{f.lineNumber}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#B8C4A2] bg-[#A3B18A]/15 px-2 py-0.5 rounded border border-[#A3B18A]/30">
                        {f.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-[#B5BCB0] font-mono">Loading findings from backend...</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CODE REVIEW WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#F0F1EA]">Files changed (1)</h2>
                <p className="text-xs text-[#B5BCB0]">Comparing original code with NVIDIA model recommended security fixes.</p>
              </div>
              <div className="text-xs font-mono text-[#B5BCB0] bg-[#292E29] border border-[#414940] px-3 py-1 rounded">
                backend/auth/jwt_handler.py
              </div>
            </div>

            {/* Embedded DiffViewer Component */}
            <div className="border border-[#414940] rounded overflow-hidden bg-[#1D211E] shadow-xs">
              <div className="bg-[#292E29] px-4 py-2 border-b border-[#414940] flex items-center justify-between text-xs font-mono text-[#B5BCB0]">
                <span className="font-semibold text-[#F0F1EA]">backend/auth/jwt_handler.py</span>
                <span className="text-[#A3B18A]">PYTHON</span>
              </div>
              <DiffViewer 
                originalCode={inputCode}
                modifiedCode={fixedCode}
                language="python"
                filePath="backend/auth/jwt_handler.py"
              />
            </div>

            {/* PR Action Box */}
            <div className="bg-[#292E29] border border-[#414940] rounded p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-[#A3B18A] uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Nebius Token Factory & NVIDIA Security Summary
              </h3>
              <p className="text-xs text-[#B5BCB0] leading-relaxed">
                Static fallback secret <code className="bg-[#1D211E] border border-[#414940] text-[#FF7B72] px-1.5 py-0.5 rounded font-mono text-[11px]">"secret123"</code> was identified in function <code className="font-mono text-[#F0F1EA]">get_jwt_secret()</code>. The AI patch enforces environment validation before token signing.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#414940]">
                <button className="bg-[#1D211E] hover:bg-[#414940] text-[#F0F1EA] border border-[#414940] px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer">
                  Add comment
                </button>
                <button className="bg-[#1D211E] hover:bg-[#414940] text-[#FF7B72] border border-[#414940] px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer">
                  Request changes
                </button>
                <button className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer shadow-xs">
                  Approve PR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY FINDINGS */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#F0F1EA] border-b border-[#414940] pb-2">Detailed Security Findings</h2>
            <div className="space-y-3">
              {reviewData.findings && reviewData.findings.map((f: any) => (
                <div key={f.id} className="bg-[#292E29] border border-[#414940] rounded p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        f.severity === 'Critical' ? 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30' : 'bg-[#D29922]/15 text-[#E6B450] border border-[#D29922]/30'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="font-mono text-xs text-[#B5BCB0]">{f.filePath}:{f.lineNumber}</span>
                    </div>
                    <span className="text-xs font-mono text-[#B8C4A2] bg-[#A3B18A]/15 px-2.5 py-0.5 rounded border border-[#A3B18A]/30">
                      {f.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#F0F1EA]">{f.title}</h3>
                  <p className="text-xs text-[#B5BCB0] leading-relaxed">{f.explanation}</p>

                  <div className="bg-[#1D211E] border border-[#414940] rounded p-3 text-xs font-mono text-[#F0F1EA] space-y-1">
                    <span className="text-[#B5BCB0] font-sans font-semibold block">Recommended Fix:</span>
                    <p className="text-[#A3B18A]">{f.recommendedFix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REVIEW HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#F0F1EA] border-b border-[#414940] pb-2">Automated Review History</h2>
            <div className="bg-[#292E29] border border-[#414940] rounded overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1D211E] border-b border-[#414940] text-[#B5BCB0] font-mono">
                    <th className="p-3">Pull Request</th>
                    <th className="p-3">Repository</th>
                    <th className="p-3">Security Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414940]">
                  {reviewData.history && reviewData.history.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[#1D211E]/40 transition">
                      <td className="p-3 font-medium text-[#F0F1EA] flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-[#A3B18A]" />
                        <div>
                          <div>{item.title}</div>
                          <span className="text-[11px] text-[#B5BCB0] font-mono">{item.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[#B5BCB0]">{item.repo}</td>
                      <td className="p-3 font-mono font-semibold text-[#A3B18A]">{item.score}/100</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.status === 'Passed' ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30' : 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#B5BCB0] font-mono">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}