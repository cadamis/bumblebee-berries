import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let orders = getAllOrders();
  if (status === "pending" || status === "fulfilled") {
    orders = orders.filter((o) => o.status === status);
  }

  return NextResponse.json(orders);
}
