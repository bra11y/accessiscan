import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── GET /api/issues — Fetch issues with filters ───

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const needsHuman = searchParams.get("needsHuman");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const userId = (session.user as any).id;

    // Build filter
    const where: any = {
      scan: { site: { userId } },
    };

    if (scanId) where.scanId = scanId;
    if (severity) where.severity = severity.toUpperCase();
    if (status) where.status = status.toUpperCase().replace("-", "_");
    if (needsHuman === "true") where.needsHuman = true;

    const [issues, total] = await Promise.all([
      db.issue.findMany({
        where,
        include: {
          reviews: {
            select: {
              id: true,
              status: true,
              feedback: true,
              reviewer: { select: { name: true } },
              createdAt: true,
            },
          },
        },
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.issue.count({ where }),
    ]);

    return NextResponse.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Issues GET error:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

// ─── PATCH /api/issues — Update issue status (single or bulk) ───

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const body = await request.json();
    const userId = (session.user as any).id;

    // ─── Bulk update: { issueIds: [...], status, needsHuman } ───
    if (body.issueIds && Array.isArray(body.issueIds)) {
      const { issueIds, status, needsHuman } = body;

      // Verify ownership of all issues
      const ownedCount = await db.issue.count({
        where: {
          id: { in: issueIds },
          scan: { site: { userId } },
        },
      });

      if (ownedCount !== issueIds.length) {
        return NextResponse.json(
          { error: "Some issues not found or not owned by you" },
          { status: 403 }
        );
      }

      const updated = await db.issue.updateMany({
        where: { id: { in: issueIds } },
        data: {
          ...(status && { status }),
          ...(needsHuman !== undefined && { needsHuman }),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        updated: updated.count,
        message: `${updated.count} issue(s) updated`,
      });
    }

    // ─── Single update: { issueId, status, needsHuman } ───
    const { issueId, status, needsHuman } = body;

    if (!issueId) {
      return NextResponse.json({ error: "issueId or issueIds required" }, { status: 400 });
    }

    const issue = await db.issue.findFirst({
      where: {
        id: issueId,
        scan: { site: { userId } },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const updated = await db.issue.update({
      where: { id: issueId },
      data: {
        ...(status && { status }),
        ...(needsHuman !== undefined && { needsHuman }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ issue: updated });
  } catch (error) {
    console.error("Issues PATCH error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
