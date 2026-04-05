import { NextRequest, NextResponse } from "next/server";
import { updateHelper, deleteHelper } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const body = (await req.json()) as {
    name?: string;
    phone?: string;
    cups_picked?: number;
    amount_paid?: number;
  };

  const update: Record<string, string | number> = {};
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.phone !== undefined) update.phone = body.phone.trim();
  if (body.cups_picked !== undefined) update.cups_picked = Number(body.cups_picked);
  if (body.amount_paid !== undefined) update.amount_paid = Number(body.amount_paid);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  updateHelper(numId, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  deleteHelper(numId);
  return NextResponse.json({ ok: true });
}
