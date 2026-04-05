import { getAvailability, getSetting } from "@/lib/db";
import { requireSetupComplete } from "@/lib/auth";
import OrderFlow from "@/components/OrderFlow";

export const dynamic = "force-dynamic";

export default function OrderPage() {
  requireSetupComplete();
  const today = new Date().toISOString().split("T")[0] as string;

  const pricePerCup    = getSetting("price_per_cup")     ?? "3.00";
  const scheduleWeeks  = parseInt(getSetting("schedule_weeks") ?? "2", 10);
  const lastDay        = getSetting("schedule_last_day") ?? "";

  const totalDays = scheduleWeeks * 7;
  let days = getAvailability(today, totalDays);

  if (lastDay) {
    days = days.filter((d) => d.date <= lastDay);
  }

  return <OrderFlow days={days} pricePerCup={pricePerCup} />;
}
