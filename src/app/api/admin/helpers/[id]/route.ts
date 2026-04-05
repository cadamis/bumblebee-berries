import { NextRequest, NextResponse } from "next/server";
import { updateHelper, deleteHelper } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const MAX_NAME_LEN = 100;
const MAX_PHONE_LEN = 30;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!isFinite(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: { name?: string; phone?: string; cups_picked?: number; amount_paid?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const update: { name?: string; phone?: string; cups_picked?: number; amount_paid?: number } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name || name.length > MAX_NAME_LEN) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    update.name = name;
  }

  if (body.phone !== undefined) {
    update.phone = body.phone.trim().slice(0, MAX_PHONE_LEN);
  }

  if (body.cups_picked !== undefined) {
    const val = Math.floor(Number(body.cups_picked));
    if (!isFinite(val) || val < 0) {
      return NextResponse.json({ error: "Invalid cups_picked." }, { status: 400 });
    }
    update.cups_picked = val;
  }

  if (body.amount_paid !== undefined) {
    const val = Number(body.amount_paid);
    if (!isFinite(val) || val < 0) {
      return NextResponse.json({ error: "Invalid amount_paid." }, { status: 400 });
    }
    update.amount_paid = val;
  }

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
  if (!isFinite(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  deleteHelper(numId);
  return NextResponse.json({ ok: true });
}
