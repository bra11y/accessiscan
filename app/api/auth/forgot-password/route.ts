import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await db.user.findUnique({ where: { email } });

    // Always return 200 — prevents email enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: true });
    }

    // Delete any existing reset tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    // Create a new token — expires in 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000);

    await db.verificationToken.create({
      data: { identifier: `reset:${email}`, token, expires },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "AccessiScan <notifications@accessiscan.com>",
      to: email,
      subject: "Reset your AccessiScan password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0; color: #1a1a2e;">
          <div style="margin-bottom: 32px;">
            <span style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; font-weight: 700; font-size: 16px; padding: 8px 16px; border-radius: 8px;">AccessiScan</span>
          </div>
          <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a;">Reset your password</h2>
          <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
            We received a request to reset the password for your AccessiScan account. Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; font-weight: 600; font-size: 15px; padding: 13px 28px; border-radius: 9px; text-decoration: none; margin-bottom: 24px;">
            Reset password →
          </a>
          <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="margin: 0; font-size: 12px; color: #cbd5e1; word-break: break-all;">
            Or copy this URL: ${resetUrl}
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">AccessiScan — Accessibility is not optional. It's a right.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}
