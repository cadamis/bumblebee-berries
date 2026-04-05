import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "./db";

const COOKIE_NAME = "bb_admin_session";
const JWT_ALG = "HS256";

function getJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error(
      "JWT_SECRET is not set. Check your .env.local file or restart the server."
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.role === "admin";
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

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME;
}

// ── Setup & password management ───────────────────────────────────────────────

/** Returns true once an admin password has been set. */
export function isSetupComplete(): boolean {
  return !!getSetting("admin_password_hash");
}

/**
 * Server-side guard: redirects to /setup if no admin password has been set yet.
 * Call this at the top of any server page that should be inaccessible before setup.
 */
export function requireSetupComplete(): void {
  if (!isSetupComplete()) redirect("/setup");
}

/**
 * Server-side guard: redirects to / if setup is already done.
 * Call this in the /setup page so it can't be revisited.
 */
export function requireSetupIncomplete(): void {
  if (isSetupComplete()) redirect("/");
}

/** Redirects to /admin/login if the admin session cookie is invalid. */
export async function requireAdmin(): Promise<void> {
  requireSetupComplete();
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = getSetting("admin_password_hash");
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 10);
  setSetting("admin_password_hash", hash);
}
