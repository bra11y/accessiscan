import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runAccessibilityScan } from "@/lib/scanner";
import { z } from "zod";

// ─── Input Validation ───
const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// ─── POST /api/scan — Start a new scan ───

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url } = scanSchema.parse(body);

    const userId = (session.user as any).id;
    const plan = (session.user as any).plan;

    // ─── Plan Limits Check ───
    const siteCount = await db.site.count({ where: { userId } });
    const planLimits: Record<string, number> = {
      FREE: 1,
      PRO: 5,
      BUSINESS: 25,
      ENTERPRISE: 999,
    };

    // Find or create the site
    let site = await db.site.findFirst({
      where: { url, userId },
    });

    if (!site) {
      if (siteCount >= (planLimits[plan] ?? 1)) {
        return NextResponse.json(
          {
            error: `Your ${plan} plan allows ${planLimits[plan]} site(s). Upgrade to scan more sites.`,
          },
          { status: 403 }
        );
      }

      site = await db.site.create({
        data: { url, userId, name: new URL(url).hostname },
      });
    }

    // ─── Create Scan Record ───
    const scan = await db.scan.create({
      data: {
        siteId: site.id,
        status: "PENDING",
      },
    });

    // ─── Run Scan (async — fire and forget for MVP) ───
    // In production, use a job queue (BullMQ, Inngest, etc.)
    // For MVP, we run it inline but don't await in the response

    runAccessibilityScan(site.id, scan.id).catch((err) => {
      console.error("Scan failed:", err);
    });

    return NextResponse.json({
      scanId: scan.id,
      siteId: site.id,
      status: "PENDING",
      message: "Scan started. Check back for results.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Failed to start scan" },
      { status: 500 }
    );
  }
}

// ─── GET /api/scan?scanId=xxx — Check scan status ───

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");

    if (!scanId) {
      // Return latest scans for the user
      const userId = (session.user as any).id;
      const scans = await db.scan.findMany({
        where: { site: { userId } },
        include: {
          site: { select: { url: true, name: true } },
          _count: { select: { issues: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({ scans });
    }

    // Return specific scan with issues
    const scan = await db.scan.findUnique({
      where: { id: scanId },
      include: {
        site: { select: { url: true, name: true } },
        issues: {
          orderBy: [
            { severity: "asc" }, // CRITICAL first
            { createdAt: "desc" },
          ],
        },
        pages: {
          select: {
            id: true,
            url: true,
            title: true,
            screenshotUrl: true,
          },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (error) {
    console.error("Scan GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan data" },
      { status: 500 }
    );
  }
}
