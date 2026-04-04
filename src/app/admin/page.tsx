import { requireAdmin } from "@/lib/auth";
import { getAllOrders, getSetting, getDb } from "@/lib/db";
import { calcPricing } from "@/lib/pricing";
import AdminOrderTable from "@/components/AdminOrderTable";
import AdminSettingsPanel from "@/components/AdminSettingsPanel";
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

  const orders = getAllOrders();
  const pricePerCup = getSetting("price_per_cup") ?? "5.00";
  const defaultDailyCap = getSetting("default_daily_cap") ?? "20";
  const dayConfigs = getDb()
    .prepare("SELECT date, max_cups FROM day_config ORDER BY date ASC")
    .all() as DayConfig[];

  const pending = orders.filter((o) => o.status === "pending");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const totalRevenue = fulfilled
    .reduce((sum, o) => sum + calcPricing(o.quantity, pricePerCup).total, 0)
    .toFixed(2);
  const pendingRevenue = pending
    .reduce((sum, o) => sum + calcPricing(o.quantity, pricePerCup).total, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={String(orders.length)}
            emoji="📦"
          />
          <StatCard
            label="Pending"
            value={String(pending.length)}
            emoji="⏳"
            highlight="yellow"
          />
          <StatCard
            label="Fulfilled"
            value={String(fulfilled.length)}
            emoji="✅"
            highlight="green"
          />
          <StatCard
            label="Revenue Collected"
            value={`$${totalRevenue}`}
            sub={`$${pendingRevenue} pending`}
            emoji="💰"
            highlight="berry"
          />
        </div>

        {/* Orders — Pending first */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders</h2>
          <AdminOrderTable initialOrders={orders} pricePerCup={pricePerCup} />
        </section>

        {/* Settings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
          <AdminSettingsPanel
            initialPrice={pricePerCup}
            initialDailyCap={defaultDailyCap}
            initialDayConfigs={dayConfigs}
          />
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  emoji,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  emoji: string;
  highlight?: "yellow" | "green" | "berry";
}) {
  const colorMap: Record<string, string> = {
    yellow: "border-yellow-300 bg-yellow-50",
    green: "border-green-300 bg-green-50",
    berry: "border-berry-300 bg-berry-50",
  };
  const base = "rounded-2xl border p-5 bg-white shadow-sm";
  const cls = highlight ? `${base} ${colorMap[highlight]}` : base;

  return (
    <div className={cls}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
