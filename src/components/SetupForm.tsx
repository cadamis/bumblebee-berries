"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword: confirm }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const strength = getStrength(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Admin Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-honey-400 focus:border-honey-400 transition-colors"
          placeholder="At least 8 characters"
          required
        />
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.pct }}
              />
            </div>
            <span className="text-xs text-gray-500">{strength.label}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-honey-400 focus:border-honey-400 transition-colors ${
            confirm.length > 0 && confirm !== password
              ? "border-red-400 bg-red-50"
              : "border-gray-300"
          }`}
          placeholder="Re-enter password"
          required
        />
        {confirm.length > 0 && confirm === password && (
          <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || password.length < 8 || password !== confirm}
        className="w-full bg-berry-600 hover:bg-berry-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        {loading ? "Setting up…" : "Create Password & Open Dashboard"}
      </button>
    </form>
  );
}

function getStrength(pw: string): { pct: string; color: string; label: string } {
  if (pw.length === 0) return { pct: "0%", color: "bg-gray-300", label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { pct: "20%", color: "bg-red-500", label: "Weak" };
  if (score === 2) return { pct: "40%", color: "bg-orange-400", label: "Fair" };
  if (score === 3) return { pct: "65%", color: "bg-yellow-400", label: "Good" };
  return { pct: "100%", color: "bg-green-500", label: "Strong" };
}
