// ─── Universal Design Types ───────────────────────────────────────────────────
// Drop into: types/ud.ts

export type UDPrincipleId =
  | "equitable-use"
  | "flexibility"
  | "simple-intuitive"
  | "perceptible-info"
  | "tolerance-error"
  | "low-effort"
  | "size-space";

export type Severity = "critical" | "serious" | "moderate" | "minor";
export type CheckStatus = "pass" | "fail" | "manual" | "na";

export interface UDCheck {
  id: string;
  title: string;
  description: string;
  wcagRef?: string;       // e.g. "WCAG 1.4.3"
  severity: Severity;
  howToFix: string;
  howToTest: string;
}

export interface UDCheckResult {
  check: UDCheck;
  status: CheckStatus;
  evidence?: string;      // What the scanner found
  element?: string;       // CSS selector or element description
  count?: number;         // How many instances found
}

export interface UDPrinciple {
  id: UDPrincipleId;
  number: number;
  title: string;
  tagline: string;
  description: string;
  color: string;          // hex accent colour
  checks: UDCheck[];
}

export interface UDPrincipleResult {
  principle: UDPrinciple;
  results: UDCheckResult[];
  score: number;          // 0–100
  passed: number;
  failed: number;
  manual: number;
}

export interface UDReport {
  url: string;
  scannedAt: string;
  overallScore: number;   // 0–100 weighted average
  principleResults: UDPrincipleResult[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    totalIssues: number;
  };
}
