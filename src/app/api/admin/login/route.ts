import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, verifyAdminPassword } from "@/lib/auth";
import { getAdminSessionCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { password?: string };
    if (!body.password) {
      return NextResponse.json({ error: "Password required." }, { status: 400 });
    }

    const ok = await verifyAdminPassword(body.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = await signAdminToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAdminSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
