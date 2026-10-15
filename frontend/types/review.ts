export interface Finding {
  id: number;
  filePath: string;
  lineNumber: number;
  category: 'security' | 'performance' | 'bug';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  explanation: string;
  recommendedFix: string;
}

export interface HistoryItem {
  id: string;
  repo: string;
  title: string;
  score: number;
  date: string;
  status: 'Passed' | 'Changes Requested' | 'Failed Checks';
}

export interface ReviewData {
  prNumber: number;
  prTitle: string;
  branch: string;
  securityScore: number;
  summary: string;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  findings: Finding[];
  history: HistoryItem[];
}