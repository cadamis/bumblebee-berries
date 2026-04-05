import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, getDb } from "@/lib/db";
import { getAdminSession, setAdminPassword } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: string): boolean {
  return DATE_RE.test(s) && !isNaN(Date.parse(s));
}

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

  let body: {
    price_per_cup?: string;
    default_daily_cap?: string;
    inventory_cups?: string;
    helper_pay_rate?: string;
    schedule_weeks?: string;
    schedule_first_day?: string;
    schedule_last_day?: string;
    new_password?: string;
    day_overrides?: { date: string; max_cups: number }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.price_per_cup !== undefined) {
    const price = parseFloat(body.price_per_cup);
    if (!isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price." }, { status: 400 });
    }
    setSetting("price_per_cup", price.toFixed(2));
  }

  if (body.default_daily_cap !== undefined) {
    const cap = parseInt(body.default_daily_cap, 10);
    if (!isFinite(cap) || cap < 0) {
      return NextResponse.json({ error: "Invalid daily cap." }, { status: 400 });
    }
    setSetting("default_daily_cap", String(cap));
  }

  if (body.inventory_cups !== undefined) {
    const inv = parseInt(body.inventory_cups, 10);
    if (!isFinite(inv) || inv < 0) {
      return NextResponse.json({ error: "Invalid inventory count." }, { status: 400 });
    }
    setSetting("inventory_cups", String(inv));
  }

  if (body.helper_pay_rate !== undefined) {
    const rate = parseFloat(body.helper_pay_rate);
    if (!isFinite(rate) || rate < 0) {
      return NextResponse.json({ error: "Invalid pay rate." }, { status: 400 });
    }
    setSetting("helper_pay_rate", rate.toFixed(2));
  }

  if (body.schedule_weeks !== undefined) {
    const weeks = parseInt(body.schedule_weeks, 10);
    if (!isFinite(weeks) || weeks < 1 || weeks > 52) {
      return NextResponse.json({ error: "Invalid schedule weeks." }, { status: 400 });
    }
    setSetting("schedule_weeks", String(weeks));
  }

  if (body.schedule_first_day !== undefined) {
    if (body.schedule_first_day !== "" && !isValidDate(body.schedule_first_day)) {
      return NextResponse.json({ error: "Invalid first day format." }, { status: 400 });
    }
    setSetting("schedule_first_day", body.schedule_first_day);
  }

  if (body.schedule_last_day !== undefined) {
    if (body.schedule_last_day !== "" && !isValidDate(body.schedule_last_day)) {
      return NextResponse.json({ error: "Invalid last day format." }, { status: 400 });
    }
    setSetting("schedule_last_day", body.schedule_last_day);
  }

  if (body.new_password) {
    if (body.new_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    await setAdminPassword(body.new_password);
  }

  if (body.day_overrides) {
    if (!Array.isArray(body.day_overrides)) {
      return NextResponse.json({ error: "Invalid day_overrides." }, { status: 400 });
    }
    const db = getDb();
    const upsert = db.prepare(
      "INSERT OR REPLACE INTO day_config (date, max_cups) VALUES (?, ?)"
    );
    const remove = db.prepare("DELETE FROM day_config WHERE date = ?");
    for (const ov of body.day_overrides) {
      if (!isValidDate(ov.date)) continue;
      const cups = Math.floor(Number(ov.max_cups));
      if (!isFinite(cups)) continue;
      if (cups < 0) {
        remove.run(ov.date);
      } else {
        upsert.run(ov.date, cups);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
