import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  slackWebhookUrl: z.string().url().optional().or(z.literal("")),
  emailAddress: z.string().email().optional().or(z.literal("")),
  enabled: z.boolean(),
});

// ── GET /api/notifications — Fetch notification settings ──

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const setting = await db.notificationSetting.findUnique({
    where: { userId },
  });

  return NextResponse.json({ setting });
}

// ── POST /api/notifications — Save notification settings ──

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slackWebhookUrl, emailAddress, enabled } = settingsSchema.parse(body);
    const userId = (session.user as any).id;

    const setting = await db.notificationSetting.upsert({
      where: { userId },
      update: {
        slackWebhookUrl: slackWebhookUrl || null,
        emailAddress: emailAddress || null,
        enabled,
      },
      create: {
        userId,
        slackWebhookUrl: slackWebhookUrl || null,
        emailAddress: emailAddress || null,
        enabled,
      },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Notification settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
