import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const order = getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const body = (await req.json()) as { status?: string };
  if (body.status !== "pending" && body.status !== "fulfilled") {
    return NextResponse.json(
      { error: "Status must be 'pending' or 'fulfilled'." },
      { status: 400 }
    );
  }

  updateOrderStatus(orderId, body.status);
  return NextResponse.json({ ...order, status: body.status });
}
