import { requireSetupComplete } from "@/lib/auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  requireSetupComplete();
  return <AdminLoginForm />;
}
