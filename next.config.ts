import type { NextConfig } from "next";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import path from "path";

// ── Bootstrap .env.local on first run ────────────────────────────────────────
// Next.js loads .env.local before this file in most cases, but we also set
// process.env.JWT_SECRET here so the current process always has it available.
const envPath = path.join(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  const secret = randomBytes(48).toString("base64url");
  writeFileSync(envPath, `JWT_SECRET=${secret}\n`, "utf-8");
  process.env.JWT_SECRET = secret;
  console.log("\n[Bumblebee Berries] .env.local not found — created with a new random JWT_SECRET.");
} else if (!process.env.JWT_SECRET) {
  // Parse manually in case Next.js hasn't loaded the file yet in this context
  const match = readFileSync(envPath, "utf-8").match(/^JWT_SECRET=(.+)$/m);
  if (match?.[1]) process.env.JWT_SECRET = match[1]!.trim();
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
