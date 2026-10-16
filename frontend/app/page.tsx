'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  GitPullRequest, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import DiffViewer from '@/components/DiffViewer';

// Hardcoded production API URL to bypass environment variable syntax issues
const API_BASE_URL = 'https://repoguard-ai-h08c.onrender.com';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'workspace' | 'findings' | 'history'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prUrlInput, setPrUrlInput] = useState('');

  // Review & Workspace state (typed as any to bypass Vercel/Netlify TypeScript strictness)
  const [reviewData, setReviewData] = useState<any>({
    prNumber: 42,
    prTitle: "Paste a public GitHub PR URL above to begin audit",
    branch: "main",
    author: "",
    securityScore: 100,
    summary: "RepoGuard AI is ready. Paste any public GitHub pull request URL and click 'Run AI Review' to execute real-time security analysis via Nebius Token Factory.",
    findingsCount: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
    findings: [],
    history: []
  });

  const [changedFiles, setChangedFiles] = useState<Array<any>>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Run Real AI Review against pasted public GitHub PR URL
  const handleRunAnalysis = async () => {
    if (!prUrlInput.trim()) {
      alert("Please paste a valid GitHub pull request URL (e.g., https://github.com/owner/repo/pull/123)");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/github/analyze-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_url: prUrlInput.trim() })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewData(data);
        setChangedFiles(data.changedFiles || []);
        setActiveFileIndex(0);
        setActiveTab('overview');
      } else {
        alert(data.detail || "Failed to analyze PR URL. Please verify the URL format and try again.");
      }
    } catch (err) {
      console.error("Failed to connect to backend:", err);
      alert(`Could not reach FastAPI backend at ${API_BASE_URL}. Ensure your backend server is running.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentFile = changedFiles[activeFileIndex] || { filename: 'No file selected', patch: 'Paste a PR URL and run review.' };

  return (
    <div className="min-h-screen bg-[#1D211E] text-[#E4E5DB] flex flex-col font-sans selection:bg-[#A3B18A]/30 selection:text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        code, pre, .font-mono {
          font-family: 'IBM Plex Mono', monospace !important;
        }
      `}</style>

      {/* Top Header Bar with GitHub PR URL Input */}
      <header className="bg-[#292E29] border-b border-[#414940] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#A3B18A]"/>
            <span className="font-semibold text-sm text-[#F0F1EA] tracking-tight">RepoGuard AI</span>
          </div>
          <span className="text-[#A6ADA2]">/</span>

          {/* PR URL Input Field */}
          <div className="flex items-center space-x-2 bg-[#1D211E] border border-[#414940] rounded px-2.5 py-1 text-xs font-mono flex-1 md:w-[420px]">
            <LinkIcon className="w-3.5 h-3.5 text-[#A3B18A] shrink-0" />
            <input 
              type="text"
              value={prUrlInput}
              onChange={(e) => setPrUrlInput(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/42"
              className="bg-transparent text-[#F0F1EA] focus:outline-none w-full placeholder-[#636E61]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-[#A3B18A] hover:bg-[#92A079] text-[#1B1E1C] font-semibold px-4 py-1.5 rounded text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin"/>
                <span>Running AI Review...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5"/>
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
              {reviewData.author && <span>author: <strong className="text-[#F0F1EA]">@{reviewData.author}</strong></span>}
            </div>
            <h1 className="text-sm font-medium text-[#F0F1EA]">{reviewData.prTitle}</h1>
          </div>

          <nav className="flex items-center space-x-1 text-xs font-medium">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'overview' ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA]'}`}>Overview</button>
            <button onClick={() => setActiveTab('workspace')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'workspace' ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA]'}`}>Files Changed ({changedFiles.length})</button>
            <button onClick={() => setActiveTab('findings')} className={`px-3 py-2 rounded border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'findings' ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA]'}`}>
              <span>Security Findings</span>
              <span className="bg-[#F85149]/20 text-[#FF7B72] border border-[#F85149]/30 text-[10px] px-1.5 py-0.2 rounded font-mono">{reviewData.findingsCount.critical}</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'history' ? 'border-[#A3B18A] text-[#F0F1EA] font-medium bg-[#1D211E]' : 'border-transparent text-[#B5BCB0] hover:text-[#F0F1EA]'}`}>Review Logs</button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-[#292E29] border border-[#414940] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1"/> Audit Complete
                  </span>
                  <span className="text-xs text-[#B5BCB0]">NVIDIA Llama analyzed real PR changes via Nebius Token Factory</span>
                </div>
                <p className="text-xs text-[#B5BCB0] leading-relaxed">{reviewData.summary}</p>
              </div>
              <button onClick={() => setActiveTab('workspace')} className="bg-[#1D211E] hover:bg-[#414940] text-[#F0F1EA] border border-[#414940] px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer">
                <span>View Code Diff</span>
                <ChevronRight className="w-4 h-4 text-[#B5BCB0]"/>
              </button>
            </div>

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
                <div className="mt-2 text-2xl font-semibold text-[#FF7B72] font-mono">{reviewData.findingsCount.critical}</div>
                <span className="text-xs text-[#FF7B72] mt-2 block font-medium">Requires remediation</span>
              </div>

              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Warnings & Style</span>
                <div className="mt-2 text-2xl font-semibold text-[#E6B450] font-mono">{reviewData.findingsCount.medium + reviewData.findingsCount.low}</div>
                <span className="text-xs text-[#E6B450] mt-2 block font-medium">Medium/Low issues</span>
              </div>

              <div className="bg-[#292E29] border border-[#414940] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#B5BCB0] uppercase">Files Audited</span>
                <div className="mt-2 text-2xl font-semibold text-[#F0F1EA] font-mono">{changedFiles.length}</div>
                <span className="text-xs text-[#A3B18A] mt-2 block font-medium">GitHub PR diff files</span>
              </div>
            </div>

            <div className="bg-[#292E29] border border-[#414940] rounded overflow-hidden shadow-xs">
              <div className="bg-[#1D211E] px-4 py-3 border-b border-[#414940] flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-[#B5BCB0] font-mono">Detected Security Findings</h3>
                <button onClick={() => setActiveTab('findings')} className="text-xs text-[#A3B18A] hover:underline font-medium cursor-pointer">View all →</button>
              </div>
              <div className="divide-y divide-[#414940]">
                {reviewData.findings && reviewData.findings.length > 0 ? (
                  reviewData.findings.map((f: any) => (
                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-[#1D211E]/40 transition">
                      <div className="flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${f.severity === 'Critical' ? 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30' : 'bg-[#D29922]/15 text-[#E6B450] border border-[#D29922]/30'}`}>
                          {f.severity}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-[#F0F1EA]">{f.title}</h4>
                          <span className="text-[11px] font-mono text-[#B5BCB0]">{f.filePath}:{f.lineNumber}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#B8C4A2] bg-[#A3B18A]/15 px-2 py-0.5 rounded border border-[#A3B18A]/30">{f.category}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-[#B5BCB0] font-mono">No security issues found in this pull request.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#F0F1EA]">Pull Request Files Changed</h2>
                <p className="text-xs text-[#B5BCB0]">Select a file to inspect its real Git diff patch.</p>
              </div>
              <div className="flex gap-2">
                {changedFiles.map((file, idx) => (
                  <button 
                    key={file.filename}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition ${activeFileIndex === idx ? 'bg-[#A3B18A] text-[#1B1E1C] font-semibold' : 'bg-[#292E29] text-[#B5BCB0] border border-[#414940]'}`}
                  >
                    {file.filename.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#414940] rounded overflow-hidden bg-[#1D211E] shadow-xs">
              <div className="bg-[#292E29] px-4 py-2 border-b border-[#414940] flex items-center justify-between text-xs font-mono text-[#B5BCB0]">
                <span className="font-semibold text-[#F0F1EA]">{currentFile.filename}</span>
                <span className="text-[#A3B18A] uppercase">{currentFile.status} (+{currentFile.additions}/-{currentFile.deletions})</span>
              </div>
              <DiffViewer filePath={currentFile.filename} language="diff" modifiedCode={currentFile.patch} originalCode=""/>
            </div>
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#F0F1EA] border-b border-[#414940] pb-2">Detailed Security Findings</h2>
            <div className="space-y-3">
              {reviewData.findings && reviewData.findings.length > 0 ? (
                reviewData.findings.map((f: any) => (
                  <div key={f.id} className="bg-[#292E29] border border-[#414940] rounded p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${f.severity === 'Critical' ? 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30' : 'bg-[#D29922]/15 text-[#E6B450] border border-[#D29922]/30'}`}>
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs text-[#B5BCB0]">{f.filePath}:{f.lineNumber}</span>
                      </div>
                      <span className="text-xs font-mono text-[#B8C4A2] bg-[#A3B18A]/15 px-2.5 py-0.5 rounded border border-[#A3B18A]/30">{f.category}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#F0F1EA]">{f.title}</h3>
                    <p className="text-xs text-[#B5BCB0] leading-relaxed">{f.explanation}</p>

                    <div className="bg-[#1D211E] border border-[#414940] rounded p-3 text-xs font-mono text-[#F0F1EA] space-y-1">
                      <span className="text-[#B5BCB0] font-sans font-semibold block">Recommended Fix:</span>
                      <p className="text-[#A3B18A]">{f.recommendedFix}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#B5BCB0] font-mono p-4">No findings recorded.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#F0F1EA] border-b border-[#414940] pb-2">Review Logs</h2>
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
                  {reviewData.history && reviewData.history.length > 0 ? (
                    reviewData.history.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#1D211E]/40 transition">
                        <td className="p-3 font-medium text-[#F0F1EA] flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-[#A3B18A]"/>
                          <div>
                            <div>{item.title}</div>
                            <span className="text-[11px] text-[#B5BCB0] font-mono">{item.id}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#B5BCB0]">{item.repo}</td>
                        <td className="p-3 font-mono font-semibold text-[#A3B18A]">{item.score}/100</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.status === 'Passed' ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30' : 'bg-[#F85149]/15 text-[#FF7B72] border border-[#F85149]/30'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#B5BCB0] font-mono">{item.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#B5BCB0] font-mono">No audit logs available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}