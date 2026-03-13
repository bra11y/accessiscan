import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  issueId: z.string(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  severity: z.enum(["CRITICAL", "SERIOUS", "MODERATE", "MINOR"]).optional(),
  fixCode: z.string().optional(),
});

// ─── POST /api/reviews — Add human review feedback ───
// As solo founder, YOU are the reviewer
// This is your competitive advantage — real human testing

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const body = await request.json();
    const { issueId, feedback, severity, fixCode } = reviewSchema.parse(body);

    const userId = (session.user as any).id;

    // Verify the issue exists
    const issue = await db.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Create review
    const review = await db.review.create({
      data: {
        issueId,
        reviewerId: userId,
        feedback,
        severity,
        fixCode,
        status: "COMPLETED",
      },
    });

    // Update issue status to reflect review completion
    await db.issue.update({
      where: { id: issueId },
      data: {
        status: "IN_REVIEW",
        ...(severity && { severity }),
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// ─── GET /api/reviews — Get review queue ───

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    // Get all issues flagged for human review
    const issues = await db.issue.findMany({
      where: {
        needsHuman: true,
        ...(status !== "all" && {
          reviews: status === "PENDING"
            ? { none: {} }
            : { some: { status: status as any } },
        }),
      },
      include: {
        scan: {
          include: {
            site: { select: { url: true, name: true } },
          },
        },
        page: {
          select: { url: true, title: true, screenshotUrl: true },
        },
        reviews: {
          include: {
            reviewer: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review queue" },
      { status: 500 }
    );
  }
}
