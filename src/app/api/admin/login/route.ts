import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, verifyAdminPassword, getAdminSessionCookieName } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// 5 failed attempts per 15 minutes per IP
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    if (!rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        { status: 429 }
      );
    }

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
      maxAge: 60 * 60 * 24,
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
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
