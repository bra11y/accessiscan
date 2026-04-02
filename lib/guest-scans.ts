import { crawlAndScan, calculateScore } from "@/lib/scanner";

// ── Types ──

export interface GuestIssue {
  severity: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  title: string;
  description: string;
  rule: string;
  ruleId: string;
  standard: string;
  element: string;
  htmlSnippet: string;
  needsHuman: boolean;
  fixSuggestion: string;
  pageUrl: string;
}

export interface GuestScanResult {
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  score?: number;
  wcagScore?: number;
  adaScore?: number;
  ariaScore?: number;
  issueCount?: number;
  pagesCount?: number;
  issues?: GuestIssue[];
  error?: string;
  createdAt: number;
}

// ── In-memory store ──
// Module-level Map — persists across requests within one server process.
// Cleared on server restart (acceptable for MVP guest scans).

export const guestScans = new Map<string, GuestScanResult>();

// ── Prune entries older than 1 hour ──
// Call this before each new guest scan to prevent unbounded growth.

export function pruneGuestScans(): void {
  const cutoff = Date.now() - 3_600_000; // 1 hour in ms
  for (const [id, scan] of Array.from(guestScans)) {
    if (scan.createdAt < cutoff) guestScans.delete(id);
  }
}

// ── Run a guest scan ──
// Calls crawlAndScan (the same engine as authenticated scans),
// stores results in guestScans Map. No database writes.

export async function runScannerForGuest(
  guestId: string,
  url: string
): Promise<void> {
  // Mark as running
  guestScans.set(guestId, {
    ...(guestScans.get(guestId) ?? { createdAt: Date.now() }),
    status: "RUNNING",
  });

  try {
    const { pages } = await crawlAndScan(url);

    const allIssues: GuestIssue[] = pages.flatMap((page) =>
      page.issues.map((issue) => ({
        ...issue,
        pageUrl: page.url,
        standard: issue.standard as string,
      }))
    );

    const totalChecks = allIssues.length + pages.length * 20;
    const wcagIssues = allIssues.filter((i) => i.standard === "WCAG");
    const adaIssues = allIssues.filter(
      (i) => i.standard === "ADA" || i.standard === "SECTION508"
    );
    const ariaIssues = allIssues.filter((i) => i.standard === "ARIA");

    const score = calculateScore(allIssues as any, totalChecks);
    const wcagScore = calculateScore(wcagIssues as any, Math.max(totalChecks * 0.5, 1));
    const adaScore = calculateScore(adaIssues as any, Math.max(totalChecks * 0.3, 1));
    const ariaScore = calculateScore(ariaIssues as any, Math.max(totalChecks * 0.2, 1));

    guestScans.set(guestId, {
      status: "COMPLETED",
      score,
      wcagScore,
      adaScore,
      ariaScore,
      issueCount: allIssues.length,
      pagesCount: pages.length,
      issues: allIssues,
      createdAt: guestScans.get(guestId)?.createdAt ?? Date.now(),
    });
  } catch (err) {
    guestScans.set(guestId, {
      status: "FAILED",
      error: err instanceof Error ? err.message : "Scan failed",
      createdAt: guestScans.get(guestId)?.createdAt ?? Date.now(),
    });
  }
}
