import { NextRequest, NextResponse } from "next/server";
import { getAllHelpers, createHelper } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getAllHelpers());
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { name?: string; phone?: string };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const helper = createHelper({ name, phone: body.phone?.trim() ?? "" });
  return NextResponse.json(helper, { status: 201 });
}
