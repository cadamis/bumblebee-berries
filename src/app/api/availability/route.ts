import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/db";

export async function GET() {
  const today = new Date().toISOString().split("T")[0] as string;
  const availability = getAvailability(today, 14);
  return NextResponse.json(availability);
}
