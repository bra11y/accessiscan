// ─── AccessiScan Type Definitions ───

export type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
export type ScanStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type IssueSeverity = "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
export type IssueStatus = "OPEN" | "IN_REVIEW" | "FIXED" | "WONT_FIX" | "FALSE_POSITIVE";
export type Standard = "WCAG" | "ADA" | "SECTION508" | "ARIA" | "EAA";
export type ReviewStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  image?: string;
}

export interface Site {
  id: string;
  url: string;
  name: string;
  userId: string;
  scans?: Scan[];
}

export interface Scan {
  id: string;
  siteId: string;
  status: ScanStatus;
  score: number | null;
  wcagScore: number | null;
  adaScore: number | null;
  ariaScore: number | null;
  pagesCount: number;
  issueCount: number;
  fixedCount: number;
  createdAt: string;
  completedAt: string | null;
  site?: { url: string; name: string };
  issues?: Issue[];
  pages?: PageResult[];
}

export interface PageResult {
  id: string;
  url: string;
  title: string;
  screenshotUrl: string | null;
}

export interface Issue {
  id: string;
  scanId: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  rule: string;
  ruleId: string;
  standard: Standard;
  element: string;
  htmlSnippet: string;
  pageUrl: string;
  status: IssueStatus;
  needsHuman: boolean;
  fixSuggestion: string;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  issueId: string;
  feedback: string;
  severity?: IssueSeverity;
  fixCode?: string;
  status: ReviewStatus;
  reviewer: { name: string };
  createdAt: string;
}

// ─── Vision Simulation Types ───

export interface VisionMode {
  id: string;
  label: string;
  filter: string;
  description: string;
}

export const VISION_MODES: VisionMode[] = [
  { id: "normal", label: "Normal Vision", filter: "none", description: "Standard view without any simulation" },
  { id: "protanopia", label: "Protanopia", filter: "url(#protanopia)", description: "Red-blind — affects ~1% of males" },
  { id: "deuteranopia", label: "Deuteranopia", filter: "url(#deuteranopia)", description: "Green-blind — affects ~5% of males" },
  { id: "tritanopia", label: "Tritanopia", filter: "url(#tritanopia)", description: "Blue-blind — rare, affects <1%" },
  { id: "achromatopsia", label: "Achromatopsia", filter: "grayscale(100%)", description: "Complete color blindness" },
  { id: "low-vision", label: "Low Vision", filter: "blur(2px)", description: "Simulates reduced visual acuity" },
  { id: "cataracts", label: "Cataracts", filter: "blur(1px) contrast(0.8) brightness(1.1)", description: "Simulates clouded lens" },
];

// ─── Plan Limits ───

export const PLAN_LIMITS: Record<Plan, {
  sites: number;
  pagesPerScan: number;
  scansPerMonth: number;
  humanReview: boolean;
  vpatExport: boolean;
  visionSim: boolean;
}> = {
  FREE: { sites: 1, pagesPerScan: 5, scansPerMonth: 3, humanReview: false, vpatExport: false, visionSim: false },
  PRO: { sites: 5, pagesPerScan: 50, scansPerMonth: 30, humanReview: true, vpatExport: false, visionSim: true },
  BUSINESS: { sites: 25, pagesPerScan: 200, scansPerMonth: 100, humanReview: true, vpatExport: true, visionSim: true },
  ENTERPRISE: { sites: 999, pagesPerScan: 1000, scansPerMonth: 999, humanReview: true, vpatExport: true, visionSim: true },
};

// ─── Severity Colors ───

export const SEVERITY_COLORS: Record<IssueSeverity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  SERIOUS: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  MODERATE: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  MINOR: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
};
