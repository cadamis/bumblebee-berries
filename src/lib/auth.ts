import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "./db";

const COOKIE_NAME = "bb_admin_session";
const JWT_ALG = "HS256";

function getJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET ?? "bumblebee-berries-secret-change-me";
  return new TextEncoder().encode(raw);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string
): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export async function requireAdmin(): Promise<void> {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");
}

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME;
}

// ── Password management ───────────────────────────────────────────────────────

const DEFAULT_PASSWORD = "berries2025";

/**
 * Returns the hashed admin password from the DB, seeding a default on first run.
 */
export function getAdminPasswordHash(): string {
  let hash = getSetting("admin_password_hash");
  if (!hash) {
    hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
    setSetting("admin_password_hash", hash);
    console.log("\n========================================");
    console.log("  Admin password not set.");
    console.log(`  Default password: ${DEFAULT_PASSWORD}`);
    console.log("  Change it in the Admin Settings panel.");
    console.log("========================================\n");
  }
  return hash;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = getAdminPasswordHash();
  return bcrypt.compare(password, hash);
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 10);
  setSetting("admin_password_hash", hash);
}
