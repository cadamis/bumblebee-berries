import { NextRequest, NextResponse } from "next/server";
import {
  isSetupComplete,
  setAdminPassword,
  signAdminToken,
  getAdminSessionCookieName,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Once setup is done this endpoint is permanently closed
  if (isSetupComplete()) {
    return NextResponse.json({ error: "Setup already complete." }, { status: 403 });
  }

  const body = (await req.json()) as {
    password?: string;
    confirmPassword?: string;
  };

  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 }
    );
  }

  await setAdminPassword(body.password);

  // Automatically log the admin in so they land straight on the dashboard
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
}
