import { getAvailability, getSetting } from "@/lib/db";
import OrderFlow from "@/components/OrderFlow";

export const dynamic = "force-dynamic";

export default function OrderPage() {
  const today = new Date().toISOString().split("T")[0] as string;
  const days = getAvailability(today, 14);
  const pricePerCup = getSetting("price_per_cup") ?? "5.00";

  return <OrderFlow days={days} pricePerCup={pricePerCup} />;
}
