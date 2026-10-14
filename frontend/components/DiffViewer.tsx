'use client';

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  filePath?: string;
}

export default function DiffViewer({
  originalCode,
  modifiedCode,
  language = 'python',
  filePath = 'backend/auth/jwt_handler.py'
}: DiffViewerProps) {
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
      {/* Editor Header Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 text-slate-200">{filePath}</span>
        </span>
        <span className="text-cyan-400 uppercase">{language}</span>
      </div>

      {/* Monaco Side-by-Side Diff Editor */}
      <div className="h-[350px] w-full">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}