import { requireAdmin } from "@/lib/auth";
import { getAllOrders, getSetting, getDb, getAllHelpers } from "@/lib/db";
import AdminTabs from "@/components/AdminTabs";
import BumblebeeLogo from "@/components/BumblebeeLogo";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

interface DayConfig {
  date: string;
  max_cups: number;
}

export default async function AdminPage() {
  await requireAdmin();

  const orders          = getAllOrders();
  const helpers         = getAllHelpers();
  const pricePerCup     = getSetting("price_per_cup")     ?? "3.00";
  const defaultDailyCap = getSetting("default_daily_cap") ?? "20";
  const inventoryCups   = getSetting("inventory_cups")    ?? "0";
  const helperPayRate   = getSetting("helper_pay_rate")   ?? "2.50";
  const scheduleWeeks   = getSetting("schedule_weeks")    ?? "2";
  const scheduleLastDay = getSetting("schedule_last_day") ?? "";
  const dayConfigs      = getDb()
    .prepare("SELECT date, max_cups FROM day_config ORDER BY date ASC")
    .all() as DayConfig[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-honey-400 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BumblebeeLogo size={36} />
            <div>
              <span className="font-display font-bold text-honey-900 text-lg">
                Bumblebee Berries
              </span>
              <span className="text-honey-700 text-sm ml-2">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-honey-800 hover:text-honey-900">
              View Store
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AdminTabs
          initialOrders={orders}
          pricePerCup={pricePerCup}
          initialPrice={pricePerCup}
          initialDailyCap={defaultDailyCap}
          initialDayConfigs={dayConfigs}
          initialHelpers={helpers}
          inventoryCups={inventoryCups}
          initialHelperPayRate={helperPayRate}
          initialScheduleWeeks={scheduleWeeks}
          initialScheduleLastDay={scheduleLastDay}
        />
      </main>
    </div>
  );
}
