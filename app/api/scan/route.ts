import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runAccessibilityScan } from "@/lib/scanner";
import { guestScans, pruneGuestScans, runScannerForGuest } from "@/lib/guest-scans";
import { z } from "zod";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// ── POST /api/scan — Start a new scan ──

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = scanSchema.parse(body);

    const session = await getServerSession(authOptions);

    // ── Guest path: no auth, in-memory only ──
    if (!session?.user) {
      pruneGuestScans();
      const guestId = crypto.randomUUID();
      guestScans.set(guestId, { status: "PENDING", createdAt: Date.now() });

      // Fire and forget — do not await
      runScannerForGuest(guestId, url).catch((err) => {
        console.error("Guest scan failed:", err);
      });

      return NextResponse.json({
        scanId: guestId,
        isGuest: true,
        status: "PENDING",
        message: "Guest scan started.",
      });
    }

    // ── Authenticated path: unchanged ──
    const userId = (session.user as any).id;

    let site = await db.site.findFirst({ where: { url, userId } });

    if (!site) {
      site = await db.site.create({
        data: { url, userId, name: new URL(url).hostname },
      });
    }

    const scan = await db.scan.create({
      data: { siteId: site.id, status: "PENDING" },
    });

    runAccessibilityScan(site.id, scan.id).catch((err) => {
      console.error("Scan failed:", err);
    });

    return NextResponse.json({
      scanId: scan.id,
      siteId: site.id,
      status: "PENDING",
      message: "Scan started.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
  }
}

// ── GET /api/scan?scanId=xxx — Check scan status ──

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    const session = await getServerSession(authOptions);

    // ── Guest lookup: no auth required for known guest scan IDs ──
    if (!session?.user) {
      if (!scanId) {
        return NextResponse.json({ error: "scanId required for guest access" }, { status: 400 });
      }
      const guestScan = guestScans.get(scanId);
      if (!guestScan) {
        return NextResponse.json({ error: "Scan not found" }, { status: 404 });
      }
      // Wrap in same shape as authenticated response for front-end compatibility
      return NextResponse.json({ scan: { ...guestScan, id: scanId, isGuest: true } });
    }

    // ── Authenticated path: unchanged ──
    const userId = (session.user as any).id;

    if (!scanId) {
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

    const scan = await db.scan.findUnique({
      where: { id: scanId },
      include: {
        site: { select: { url: true, name: true } },
        issues: { orderBy: [{ severity: "asc" }, { createdAt: "desc" }] },
        pages: { select: { id: true, url: true, title: true, screenshotUrl: true } },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (error) {
    console.error("Scan GET error:", error);
    return NextResponse.json({ error: "Failed to fetch scan data" }, { status: 500 });
  }
}
