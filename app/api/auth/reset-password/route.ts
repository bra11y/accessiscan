import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = schema.parse(body);

    // Look up token
    const record = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.identifier !== `reset:${email}`) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete used token
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
