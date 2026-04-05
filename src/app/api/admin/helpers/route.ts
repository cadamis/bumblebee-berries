import { NextRequest, NextResponse } from "next/server";
import { getAllHelpers, createHelper } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const MAX_NAME_LEN = 100;
const MAX_PHONE_LEN = 30;

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getAllHelpers());
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length > MAX_NAME_LEN) {
    return NextResponse.json({ error: "Name is required (max 100 chars)." }, { status: 400 });
  }

  const phone = (body.phone?.trim() ?? "").slice(0, MAX_PHONE_LEN);
  const helper = createHelper({ name, phone });
  return NextResponse.json(helper, { status: 201 });
}
