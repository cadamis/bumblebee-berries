import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, getDb } from "@/lib/db";
import { getAdminSession, setAdminPassword } from "@/lib/auth";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    price_per_cup: getSetting("price_per_cup") ?? "5.00",
    default_daily_cap: getSetting("default_daily_cap") ?? "20",
    day_configs: getDb()
      .prepare("SELECT date, max_cups FROM day_config ORDER BY date ASC")
      .all(),
  });
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    price_per_cup?: string;
    default_daily_cap?: string;
    new_password?: string;
    day_overrides?: { date: string; max_cups: number }[];
  };

  if (body.price_per_cup !== undefined) {
    const price = parseFloat(body.price_per_cup);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }
    setSetting("price_per_cup", price.toFixed(2));
  }

  if (body.default_daily_cap !== undefined) {
    const cap = parseInt(body.default_daily_cap, 10);
    if (isNaN(cap) || cap < 0) {
      return NextResponse.json({ error: "Invalid daily cap." }, { status: 400 });
    }
    setSetting("default_daily_cap", String(cap));
  }

  if (body.new_password) {
    await setAdminPassword(body.new_password);
  }

  if (body.day_overrides) {
    const db = getDb();
    const upsert = db.prepare(
      "INSERT OR REPLACE INTO day_config (date, max_cups) VALUES (?, ?)"
    );
    const remove = db.prepare("DELETE FROM day_config WHERE date = ?");
    for (const ov of body.day_overrides) {
      if (ov.max_cups < 0) {
        remove.run(ov.date);
      } else {
        upsert.run(ov.date, ov.max_cups);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
