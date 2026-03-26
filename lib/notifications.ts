/**
 * ─── Notification Sender ───
 *
 * Sends scan completion notifications via Slack webhook and/or email (Resend).
 * Called by the scanner after a scan completes.
 */

import { db } from "@/lib/db";

interface ScanSummary {
  scanId: string;
  siteUrl: string;
  score: number;
  wcagScore: number;
  adaScore: number;
  ariaScore: number;
  issueCount: number;
  pagesCount: number;
}

/**
 * Send notifications to the user who owns the scan's site.
 * Looks up notification settings and dispatches via configured channels.
 */
export async function sendScanNotifications(
  userId: string,
  summary: ScanSummary
): Promise<void> {
  try {
    const setting = await db.notificationSetting.findUnique({
      where: { userId },
    });

    if (!setting || !setting.enabled) return;

    const promises: Promise<void>[] = [];

    if (setting.slackWebhookUrl) {
      promises.push(sendSlackNotification(setting.slackWebhookUrl, summary));
    }

    if (setting.emailAddress) {
      promises.push(sendEmailNotification(setting.emailAddress, summary));
    }

    await Promise.allSettled(promises);
  } catch (error) {
    // Notification failures should never break the scan flow
    console.error("Failed to send notifications:", error);
  }
}

// ─── Slack Webhook ───

async function sendSlackNotification(
  webhookUrl: string,
  summary: ScanSummary
): Promise<void> {
  const scoreEmoji =
    summary.score >= 80 ? "green" : summary.score >= 50 ? "yellow" : "red";

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `AccessiScan — Scan Complete`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Site:*\n${summary.siteUrl}` },
          { type: "mrkdwn", text: `*Overall Score:*\n${summary.score}/100` },
          { type: "mrkdwn", text: `*Issues Found:*\n${summary.issueCount}` },
          { type: "mrkdwn", text: `*Pages Scanned:*\n${summary.pagesCount}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*WCAG:* ${summary.wcagScore}%` },
          { type: "mrkdwn", text: `*ADA:* ${summary.adaScore}%` },
          { type: "mrkdwn", text: `*ARIA:* ${summary.ariaScore}%` },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Scan ID: \`${summary.scanId}\` | Status: :large_${scoreEmoji}_circle: ${summary.score >= 80 ? "Passing" : summary.score >= 50 ? "Needs Work" : "Failing"}`,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Slack webhook failed:", res.status, await res.text());
  }
}

// ─── Email via Resend ───

async function sendEmailNotification(
  email: string,
  summary: ScanSummary
): Promise<void> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const scoreLabel =
      summary.score >= 80 ? "Passing" : summary.score >= 50 ? "Needs Work" : "Failing";

    await resend.emails.send({
      from: "AccessiScan <notifications@accessiscan.com>",
      to: email,
      subject: `Scan Complete — ${summary.siteUrl} scored ${summary.score}/100`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
          <h2 style="margin: 0 0 24px; font-size: 20px; color: #1a1a2e;">
            AccessiScan — Scan Complete
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Site</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 14px;">${summary.siteUrl}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Overall Score</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 700; font-size: 20px; color: ${summary.score >= 80 ? '#059669' : summary.score >= 50 ? '#D97706' : '#DC2626'};">${summary.score}/100</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Status</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 14px;">${scoreLabel}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Issues Found</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 14px;">${summary.issueCount}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Pages Scanned</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 14px;">${summary.pagesCount}</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #666; font-size: 14px;">Breakdown</td>
              <td style="padding: 12px; font-size: 14px;">WCAG ${summary.wcagScore}% · ADA ${summary.adaScore}% · ARIA ${summary.ariaScore}%</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #999; margin-top: 24px;">
            You received this because you enabled email notifications in AccessiScan.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email notification failed:", error);
  }
}
