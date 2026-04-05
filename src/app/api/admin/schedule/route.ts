import { NextRequest, NextResponse } from "next/server";
import { getAllScheduleAssignments, createScheduleAssignment } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getAllScheduleAssignments());
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { date?: string; helper_id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.date || !DATE_RE.test(body.date) || isNaN(Date.parse(body.date))) {
    return NextResponse.json({ error: "Invalid or missing date." }, { status: 400 });
  }

  const helper_id = Math.floor(Number(body.helper_id));
  if (!isFinite(helper_id) || helper_id <= 0) {
    return NextResponse.json({ error: "Invalid helper_id." }, { status: 400 });
  }

  const assignment = createScheduleAssignment({ date: body.date, helper_id });

  if (!assignment) {
    return NextResponse.json({ error: "Already assigned." }, { status: 409 });
  }

  return NextResponse.json(assignment, { status: 201 });
}
