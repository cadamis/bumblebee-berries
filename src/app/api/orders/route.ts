import { NextRequest, NextResponse } from "next/server";
import { createOrder, getAvailability } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      customer_name?: string;
      customer_phone?: string;
      order_date?: string;
      quantity?: number;
    };

    const { customer_name, customer_phone, order_date } = body;
    const quantity = body.quantity ?? 1;

    if (!customer_name || !customer_phone || !order_date) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0] as string;
    if (order_date < today) {
      return NextResponse.json(
        { error: "Cannot order for a past date." },
        { status: 400 }
      );
    }

    const [day] = getAvailability(order_date, 1);
    if (!day || day.available < quantity) {
      return NextResponse.json(
        { error: "Not enough cups available on that date." },
        { status: 409 }
      );
    }

    const order = createOrder({ customer_name, customer_phone, order_date, quantity });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
