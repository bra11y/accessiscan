// ─── API Route: POST /api/ud-scan ─────────────────────────────────────────────
// Drop into: app/api/ud-scan/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runUDScan } from "@/lib/ud-scanner";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Run the scan
    const report = await runUDScan(parsedUrl.toString());

    // Optionally store the report in the database
    // You can attach it to an existing site record or store standalone
    // Uncomment and adapt to your schema:
    /*
    const userId = (session.user as any).id;
    await db.udReport.create({
      data: {
        url: report.url,
        overallScore: report.overallScore,
        scannedAt: new Date(report.scannedAt),
        userId,
        data: JSON.stringify(report),
      },
    });
    */

    return NextResponse.json({ report }, { status: 200 });
  } catch (error: any) {
    console.error("UD scan error:", error);
    return NextResponse.json(
      { error: error.message || "Scan failed. Check the URL and try again." },
      { status: 500 }
    );
  }
}

// GET /api/ud-scan?url=... — lightweight check without full scan
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url param required" }, { status: 400 });
  return NextResponse.json({ message: "Use POST to run a full UD scan", url });
}
