import { NextRequest, NextResponse } from "next/server";
import { deleteScheduleAssignment } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

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

  deleteScheduleAssignment(numId);
  return NextResponse.json({ ok: true });
}
