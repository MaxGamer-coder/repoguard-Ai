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
    <div className="min-h-screen bg-[#F6F8FA] text-[#24292F] flex flex-col font-sans selection:bg-[#2F81F7]/20 selection:text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        code, pre, .font-mono {
          font-family: 'IBM Plex Mono', monospace !important;
        }
      `}</style>

      {/* Top Header Bar with GitHub PR URL Input */}
      <header className="bg-white border-b border-[#D0D7DE] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50 shadow-xs">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#2F81F7]"/>
            <span className="font-semibold text-sm text-[#24292F] tracking-tight">RepoGuard AI</span>
          </div>
          <span className="text-[#57606A]">/</span>

          {/* PR URL Input Field */}
          <div className="flex items-center space-x-2 bg-[#F6F8FA] border border-[#D0D7DE] rounded px-2.5 py-1 text-xs font-mono flex-1 md:w-[420px]">
            <LinkIcon className="w-3.5 h-3.5 text-[#2F81F7] shrink-0" />
            <input 
              type="text"
              value={prUrlInput}
              onChange={(e) => setPrUrlInput(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/42"
              className="bg-transparent text-[#24292F] focus:outline-none w-full placeholder-[#8C959F]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-[#2F81F7] hover:bg-[#1F6FEB] text-white font-semibold px-4 py-1.5 rounded text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
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
      <div className="bg-white border-b border-[#D0D7DE] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#57606A]">
              <span className="bg-[#DDF4FF] text-[#2F81F7] border border-[#2F81F7]/30 px-2 py-0.5 rounded font-medium">
                PR #{reviewData.prNumber}
              </span>
              <span>branch: <strong className="text-[#24292F]">{reviewData.branch}</strong></span>
              {reviewData.author && <span>author: <strong className="text-[#24292F]">@{reviewData.author}</strong></span>}
            </div>
            <h1 className="text-sm font-medium text-[#24292F]">{reviewData.prTitle}</h1>
          </div>

          <nav className="flex items-center space-x-1 text-xs font-medium">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'overview' ? 'border-[#2F81F7] text-[#24292F] font-medium bg-[#F6F8FA]' : 'border-transparent text-[#57606A] hover:text-[#24292F]'}`}>Overview</button>
            <button onClick={() => setActiveTab('workspace')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'workspace' ? 'border-[#2F81F7] text-[#24292F] font-medium bg-[#F6F8FA]' : 'border-transparent text-[#57606A] hover:text-[#24292F]'}`}>Files Changed ({changedFiles.length})</button>
            <button onClick={() => setActiveTab('findings')} className={`px-3 py-2 rounded border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'findings' ? 'border-[#2F81F7] text-[#24292F] font-medium bg-[#F6F8FA]' : 'border-transparent text-[#57606A] hover:text-[#24292F]'}`}>
              <span>Security Findings</span>
              <span className="bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/30 text-[10px] px-1.5 py-0.2 rounded font-mono">{reviewData.findingsCount.critical}</span>
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-3 py-2 rounded border-b-2 transition cursor-pointer ${activeTab === 'history' ? 'border-[#2F81F7] text-[#24292F] font-medium bg-[#F6F8FA]' : 'border-transparent text-[#57606A] hover:text-[#24292F]'}`}>Review Logs</button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#D0D7DE] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/30">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1"/> Audit Complete
                  </span>
                  <span className="text-xs text-[#57606A]">NVIDIA Llama analyzed real PR changes via Nebius Token Factory</span>
                </div>
                <p className="text-xs text-[#57606A] leading-relaxed">{reviewData.summary}</p>
              </div>
              <button onClick={() => setActiveTab('workspace')} className="bg-[#F6F8FA] hover:bg-[#D0D7DE]/50 text-[#24292F] border border-[#D0D7DE] px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer">
                <span>View Code Diff</span>
                <ChevronRight className="w-4 h-4 text-[#57606A]"/>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#D0D7DE] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#57606A] uppercase">Security Score</span>
                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-semibold text-[#2F81F7] font-mono">{reviewData.securityScore}</span>
                  <span className="text-[#57606A] text-xs">/ 100</span>
                </div>
                <div className="w-full bg-[#F6F8FA] h-1.5 rounded mt-3 overflow-hidden border border-[#D0D7DE]">
                  <div className="bg-[#2F81F7] h-full rounded" style={{ width: `${reviewData.securityScore}%` }} />
                </div>
              </div>

              <div className="bg-white border border-[#D0D7DE] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#57606A] uppercase">Critical Vulnerability</span>
                <div className="mt-2 text-2xl font-semibold text-[#DA3633] font-mono">{reviewData.findingsCount.critical}</div>
                <span className="text-xs text-[#DA3633] mt-2 block font-medium">Requires remediation</span>
              </div>

              <div className="bg-white border border-[#D0D7DE] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#57606A] uppercase">Warnings & Style</span>
                <div className="mt-2 text-2xl font-semibold text-[#9E6A03] font-mono">{reviewData.findingsCount.medium + reviewData.findingsCount.low}</div>
                <span className="text-xs text-[#9E6A03] mt-2 block font-medium">Medium/Low issues</span>
              </div>

              <div className="bg-white border border-[#D0D7DE] rounded p-4 shadow-xs">
                <span className="text-xs font-mono text-[#57606A] uppercase">Files Audited</span>
                <div className="mt-2 text-2xl font-semibold text-[#24292F] font-mono">{changedFiles.length}</div>
                <span className="text-xs text-[#2F81F7] mt-2 block font-medium">GitHub PR diff files</span>
              </div>
            </div>

            <div className="bg-white border border-[#D0D7DE] rounded overflow-hidden shadow-xs">
              <div className="bg-[#F6F8FA] px-4 py-3 border-b border-[#D0D7DE] flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-[#57606A] font-mono">Detected Security Findings</h3>
                <button onClick={() => setActiveTab('findings')} className="text-xs text-[#2F81F7] hover:underline font-medium cursor-pointer">View all →</button>
              </div>
              <div className="divide-y divide-[#D0D7DE]">
                {reviewData.findings && reviewData.findings.length > 0 ? (
                  reviewData.findings.map((f: any) => (
                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-[#F6F8FA] transition">
                      <div className="flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${f.severity === 'Critical' ? 'bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/30' : 'bg-[#9E6A03]/15 text-[#9E6A03] border border-[#9E6A03]/30'}`}>
                          {f.severity}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-[#24292F]">{f.title}</h4>
                          <span className="text-[11px] font-mono text-[#57606A]">{f.filePath}:{f.lineNumber}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-[#2F81F7] bg-[#DDF4FF] px-2 py-0.5 rounded border border-[#2F81F7]/30">{f.category}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-[#57606A] font-mono">No security issues found in this pull request.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#24292F]">Pull Request Files Changed</h2>
                <p className="text-xs text-[#57606A]">Select a file to inspect its real Git diff patch.</p>
              </div>
              <div className="flex gap-2">
                {changedFiles.map((file, idx) => (
                  <button 
                    key={file.filename}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition ${activeFileIndex === idx ? 'bg-[#2F81F7] text-white font-semibold' : 'bg-white text-[#57606A] border border-[#D0D7DE]'}`}
                  >
                    {file.filename.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#D0D7DE] rounded overflow-hidden bg-white shadow-xs">
              <div className="bg-[#F6F8FA] px-4 py-2 border-b border-[#D0D7DE] flex items-center justify-between text-xs font-mono text-[#57606A]">
                <span className="font-semibold text-[#24292F]">{currentFile.filename}</span>
                <span className="text-[#2F81F7] uppercase">{currentFile.status} (+{currentFile.additions}/-{currentFile.deletions})</span>
              </div>
              <DiffViewer filePath={currentFile.filename} language="diff" modifiedCode={currentFile.patch} originalCode=""/>
            </div>
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#24292F] border-b border-[#D0D7DE] pb-2">Detailed Security Findings</h2>
            <div className="space-y-3">
              {reviewData.findings && reviewData.findings.length > 0 ? (
                reviewData.findings.map((f: any) => (
                  <div key={f.id} className="bg-white border border-[#D0D7DE] rounded p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${f.severity === 'Critical' ? 'bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/30' : 'bg-[#9E6A03]/15 text-[#9E6A03] border border-[#9E6A03]/30'}`}>
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs text-[#57606A]">{f.filePath}:{f.lineNumber}</span>
                      </div>
                      <span className="text-xs font-mono text-[#2F81F7] bg-[#DDF4FF] px-2.5 py-0.5 rounded border border-[#2F81F7]/30">{f.category}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#24292F]">{f.title}</h3>
                    <p className="text-xs text-[#57606A] leading-relaxed">{f.explanation}</p>

                    <div className="bg-[#F6F8FA] border border-[#D0D7DE] rounded p-3 text-xs font-mono text-[#24292F] space-y-1">
                      <span className="text-[#57606A] font-sans font-semibold block">Recommended Fix:</span>
                      <p className="text-[#2F81F7]">{f.recommendedFix}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#57606A] font-mono p-4">No findings recorded.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#24292F] border-b border-[#D0D7DE] pb-2">Review Logs</h2>
            <div className="bg-white border border-[#D0D7DE] rounded overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F6F8FA] border-b border-[#D0D7DE] text-[#57606A] font-mono">
                    <th className="p-3">Pull Request</th>
                    <th className="p-3">Repository</th>
                    <th className="p-3">Security Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D0D7DE]">
                  {reviewData.history && reviewData.history.length > 0 ? (
                    reviewData.history.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F6F8FA] transition">
                        <td className="p-3 font-medium text-[#24292F] flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-[#2F81F7]"/>
                          <div>
                            <div>{item.title}</div>
                            <span className="text-[11px] text-[#57606A] font-mono">{item.id}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#57606A]">{item.repo}</td>
                        <td className="p-3 font-mono font-semibold text-[#2F81F7]">{item.score}/100</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.status === 'Passed' ? 'bg-[#238636]/15 text-[#238636] border border-[#238636]/30' : 'bg-[#DA3633]/15 text-[#DA3633] border border-[#DA3633]/30'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-[#57606A] font-mono">{item.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#57606A] font-mono">No audit logs available.</td>
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