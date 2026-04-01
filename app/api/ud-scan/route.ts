import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runUDScan } from "@/lib/ud-scanner";
import { db } from "@/lib/db";

// POST /api/ud-scan — Create a pending report and start background scan
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

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const report = await db.uDReport.create({
      data: {
        userId,
        url: parsedUrl.toString(),
        status: "PENDING",
      },
    });

    // Fire and forget — do NOT await
    runUDScan(parsedUrl.toString(), report.id).catch((err) => {
      console.error("UD scan failed:", err);
    });

    return NextResponse.json({ reportId: report.id, status: "PENDING" }, { status: 200 });
  } catch (error: any) {
    console.error("UD scan POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to start scan" }, { status: 500 });
  }
}

// GET /api/ud-scan?reportId=xxx — Poll for status and results
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const reportId = request.nextUrl.searchParams.get("reportId");
    if (!reportId) {
      return NextResponse.json({ error: "reportId param required" }, { status: 400 });
    }

    const report = await db.uDReport.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      reportId: report.id,
      status: report.status,
      overallScore: report.overallScore,
      report: report.status === "COMPLETED" ? report.data : null,
    });
  } catch (error: any) {
    console.error("UD scan GET error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
