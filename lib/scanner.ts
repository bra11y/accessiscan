/**
 * ─── AccessiScan: Core Scanning Engine ───
 *
 * This is the heart of the product.
 * It crawls a website, runs axe-core on each page,
 * captures screenshots, and classifies issues.
 *
 * "The First Rule of ARIA: Don't use ARIA if you can
 *  use a native HTML element instead."
 *
 * Architecture (Pyramid Principle):
 * 1. URL Validation → is it reachable?
 * 2. Page Discovery → crawl internal links
 * 3. Accessibility Scan → axe-core on each page
 * 4. Screenshot Capture → visual evidence
 * 5. Issue Classification → severity + standard mapping
 * 6. Score Calculation → weighted compliance score
 */

import { db } from "@/lib/db";
import type { IssueSeverity, Standard } from "@prisma/client";

// ─── Types ───

interface ScanResult {
  scanId: string;
  score: number;
  wcagScore: number;
  adaScore: number;
  ariaScore: number;
  totalIssues: number;
  pages: PageResult[];
}

interface PageResult {
  url: string;
  title: string;
  screenshotPath?: string;
  issues: IssueResult[];
}

interface IssueResult {
  severity: IssueSeverity;
  title: string;
  description: string;
  rule: string;
  ruleId: string;
  standard: Standard;
  element: string;
  htmlSnippet: string;
  needsHuman: boolean;
  fixSuggestion: string;
}

// ─── Severity Mapping from axe-core impact levels ───

const SEVERITY_MAP: Record<string, IssueSeverity> = {
  critical: "CRITICAL",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
};

// ─── Rules that ALWAYS need human review ───
// These are things automation can flag but can't truly verify

const HUMAN_REVIEW_RULES = new Set([
  "image-alt",         // alt text QUALITY requires human judgment
  "color-contrast",    // context-dependent contrast
  "link-name",         // link text meaning requires context
  "label",             // form label clarity
  "document-title",    // title appropriateness
  "html-lang-valid",   // language correctness
  "frame-title",       // iframe title meaning
  "input-image-alt",   // image input alt quality
  "aria-label",        // ARIA label quality
]);

// ─── Standard Classification ───
// Maps axe-core tags to compliance standards

function classifyStandard(tags: string[]): Standard {
  if (tags.some((t) => t.startsWith("wcag"))) return "WCAG";
  if (tags.includes("section508")) return "SECTION508";
  if (tags.some((t) => t.startsWith("best-practice"))) return "ARIA";
  // EAA maps to WCAG criteria
  return "WCAG";
}

// ─── Fix Suggestion Generator ───
// Provides actionable, First-Rule-of-ARIA-first suggestions

function generateFixSuggestion(ruleId: string, element: string): string {
  const suggestions: Record<string, string> = {
    "image-alt":
      'Add a descriptive alt attribute: <img alt="Description of what the image shows">. If decorative, use alt="".',
    "button-name":
      "Add text content inside the button, or use aria-label. Prefer visible text (First Rule of ARIA).",
    "color-contrast":
      "Increase the contrast ratio to at least 4.5:1 for normal text or 3:1 for large text (18px+ or 14px+ bold).",
    "label":
      "Associate a <label> element with the input using for/id attributes. Avoid using aria-label when a visible label works.",
    "link-name":
      'Add descriptive text to the link. Avoid "click here" or "read more" without context.',
    "document-title":
      "Add a unique, descriptive <title> element in the <head> section.",
    "html-has-lang":
      'Add a lang attribute to the <html> element: <html lang="en">.',
    "landmark-one-main":
      "Wrap your primary content in a <main> element. Only one <main> per page.",
    "region":
      "Wrap content sections in semantic elements like <section>, <nav>, <aside>, or <header>.",
    "heading-order":
      "Use headings in order (h1 → h2 → h3). Don't skip levels. Each page should have exactly one h1.",
    "aria-hidden-focus":
      "Elements with aria-hidden='true' should not contain focusable elements. Remove tabindex or aria-hidden.",
    "tabindex":
      "Avoid tabindex values greater than 0. Use tabindex='0' to add to natural tab order, or tabindex='-1' for programmatic focus.",
  };

  return (
    suggestions[ruleId] ??
    `Review the element and ensure it meets WCAG 2.1 AA criteria. Apply the First Rule of ARIA: use native HTML elements when possible.`
  );
}

// ─── Score Calculator ───
// Weighted scoring: critical issues hurt more

function calculateScore(issues: IssueResult[], totalChecks: number): number {
  if (totalChecks === 0) return 100;

  const weights: Record<string, number> = {
    CRITICAL: 10,
    SERIOUS: 5,
    MODERATE: 2,
    MINOR: 1,
  };

  const penalty = issues.reduce(
    (sum, issue) => sum + (weights[issue.severity] || 1),
    0
  );

  // Score is 100 minus weighted penalty, clamped to 0-100
  const rawScore = 100 - (penalty / totalChecks) * 100;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

// ─── Main Scan Function ───
// This is called by the API route /api/scan

export async function runAccessibilityScan(
  siteId: string,
  scanId: string
): Promise<ScanResult> {
  // Update scan status to RUNNING
  await db.scan.update({
    where: { id: scanId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  try {
    const site = await db.site.findUniqueOrThrow({
      where: { id: siteId },
    });

    // ─── Step 1: Launch browser and crawl ───
    // In production, use Puppeteer. For MVP, we use a simplified approach.
    // The scanning happens server-side via axe-core + jsdom or Puppeteer.

    const pages = await crawlAndScan(site.url);

    // ─── Step 2: Store results in database ───
    let allIssues: IssueResult[] = [];
    let totalChecks = 0;

    for (const page of pages) {
      // Create page record
      const pageRecord = await db.page.create({
        data: {
          scanId,
          url: page.url,
          title: page.title,
          screenshotUrl: page.screenshotPath,
        },
      });

      // Create issue records
      for (const issue of page.issues) {
        await db.issue.create({
          data: {
            scanId,
            pageId: pageRecord.id,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            rule: issue.rule,
            ruleId: issue.ruleId,
            standard: issue.standard,
            element: issue.element,
            htmlSnippet: issue.htmlSnippet,
            pageUrl: page.url,
            needsHuman: issue.needsHuman,
            fixSuggestion: issue.fixSuggestion,
            status: issue.needsHuman ? "IN_REVIEW" : "OPEN",
          },
        });
      }

      allIssues = [...allIssues, ...page.issues];
      totalChecks += page.issues.length + 20; // 20 assumed passes per page
    }

    // ─── Step 3: Calculate scores ───
    const wcagIssues = allIssues.filter((i) => i.standard === "WCAG");
    const adaIssues = allIssues.filter(
      (i) => i.standard === "ADA" || i.standard === "SECTION508"
    );
    const ariaIssues = allIssues.filter((i) => i.standard === "ARIA");

    const overallScore = calculateScore(allIssues, totalChecks);
    const wcagScore = calculateScore(wcagIssues, Math.max(totalChecks * 0.5, 1));
    const adaScore = calculateScore(adaIssues, Math.max(totalChecks * 0.3, 1));
    const ariaScore = calculateScore(ariaIssues, Math.max(totalChecks * 0.2, 1));

    // ─── Step 4: Update scan record ───
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: "COMPLETED",
        score: overallScore,
        wcagScore,
        adaScore,
        ariaScore,
        pagesCount: pages.length,
        issueCount: allIssues.length,
        completedAt: new Date(),
      },
    });

    return {
      scanId,
      score: overallScore,
      wcagScore,
      adaScore,
      ariaScore,
      totalIssues: allIssues.length,
      pages,
    };
  } catch (error) {
    // Mark scan as failed
    await db.scan.update({
      where: { id: scanId },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw error;
  }
}

// ─── Page Crawler + axe-core Scanner ───
// MVP version: scans the homepage + up to 10 linked pages
// Production version: full site crawl with Puppeteer

async function crawlAndScan(baseUrl: string): Promise<PageResult[]> {
  // Dynamic import for server-side only
  const puppeteer = await import("puppeteer");
  const axeCore = await import("axe-core");

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: PageResult[] = [];
  const visited = new Set<string>();
  const toVisit = [baseUrl];
  const maxPages = 10; // Free tier limit

  try {
    while (toVisit.length > 0 && visited.size < maxPages) {
      const url = toVisit.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        // Inject axe-core and run analysis
        await page.addScriptTag({
          content: axeCore.source,
        });

        const axeResults = await page.evaluate(async () => {
          // @ts-ignore - axe is injected via script tag
          return await window.axe.run(document, {
            runOnly: {
              type: "tag",
              values: [
                "wcag2a",
                "wcag2aa",
                "wcag21a",
                "wcag21aa",
                "best-practice",
                "section508",
              ],
            },
          });
        });

        // Capture screenshot for human review
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: "png",
        });

        // TODO: Upload screenshot to Supabase Storage
        // For MVP, store locally or skip

        const title = await page.title();

        // Transform axe results to our format
        const issues: IssueResult[] = axeResults.violations.flatMap(
          (violation: any) =>
            violation.nodes.map((node: any) => ({
              severity: SEVERITY_MAP[violation.impact] || "MINOR",
              title: violation.help,
              description: violation.description,
              rule: `WCAG 2.1 - ${violation.id}`,
              ruleId: violation.id,
              standard: classifyStandard(violation.tags),
              element: node.target?.[0] || "unknown",
              htmlSnippet: node.html || "",
              needsHuman: HUMAN_REVIEW_RULES.has(violation.id),
              fixSuggestion: generateFixSuggestion(violation.id, node.html),
            }))
        );

        results.push({
          url,
          title,
          issues,
        });

        // Discover linked pages (same domain only)
        const links = await page.evaluate((base: string) => {
          const baseHost = new URL(base).hostname;
          return Array.from(document.querySelectorAll("a[href]"))
            .map((a) => {
              try {
                const href = new URL(
                  (a as HTMLAnchorElement).href,
                  base
                ).toString();
                return new URL(href).hostname === baseHost ? href : null;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as string[];
        }, baseUrl);

        // Add new links to crawl queue
        for (const link of links.slice(0, 20)) {
          const cleanUrl = link.split("#")[0].split("?")[0]; // strip hash and query
          if (!visited.has(cleanUrl) && !toVisit.includes(cleanUrl)) {
            toVisit.push(cleanUrl);
          }
        }
      } catch (pageError) {
        console.error(`Failed to scan ${url}:`, pageError);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

// ─── Export for API routes ───
export { calculateScore, generateFixSuggestion, classifyStandard };
