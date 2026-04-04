import { requireSetupComplete } from "@/lib/auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  requireSetupComplete();
  return <AdminLoginForm />;
}
