import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "bumblebee.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name    TEXT NOT NULL,
      customer_email   TEXT NOT NULL,
      customer_phone   TEXT NOT NULL,
      order_date       TEXT NOT NULL,
      quantity         INTEGER NOT NULL DEFAULT 1,
      status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','fulfilled')),
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS day_config (
      date      TEXT PRIMARY KEY,
      max_cups  INTEGER NOT NULL
    );
  `);

  // Seed default settings if they don't exist
  const setDefault = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  setDefault.run("price_per_cup", "5.00");
  setDefault.run("default_daily_cap", "20");
}

// ── Settings helpers ──────────────────────────────────────────────────────────

export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
    .run(key, value);
}

// ── Availability helpers ──────────────────────────────────────────────────────

export interface DayAvailability {
  date: string;       // YYYY-MM-DD
  maxCups: number;
  orderedCups: number;
  available: number;
}

export function getAvailability(
  fromDate: string,
  days: number
): DayAvailability[] {
  const db = getDb();
  const defaultCap = parseInt(getSetting("default_daily_cap") ?? "20", 10);

  const result: DayAvailability[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0] as string;

    const cfg = db
      .prepare("SELECT max_cups FROM day_config WHERE date = ?")
      .get(dateStr) as { max_cups: number } | undefined;
    const maxCups = cfg?.max_cups ?? defaultCap;

    const ordered = db
      .prepare(
        "SELECT COALESCE(SUM(quantity),0) AS total FROM orders WHERE order_date = ? AND status != 'cancelled'"
      )
      .get(dateStr) as { total: number };

    const orderedCups = ordered.total;
    result.push({
      date: dateStr,
      maxCups,
      orderedCups,
      available: Math.max(0, maxCups - orderedCups),
    });
  }
  return result;
}

// ── Order helpers ─────────────────────────────────────────────────────────────

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_date: string;
  quantity: number;
  status: "pending" | "fulfilled";
  created_at: string;
}

export function createOrder(data: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_date: string;
  quantity: number;
}): Order {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO orders (customer_name, customer_email, customer_phone, order_date, quantity)
    VALUES (@customer_name, @customer_email, @customer_phone, @order_date, @quantity)
  `);
  const info = stmt.run(data);
  return db
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(info.lastInsertRowid) as Order;
}

export function getAllOrders(): Order[] {
  return getDb()
    .prepare("SELECT * FROM orders ORDER BY order_date ASC, created_at ASC")
    .all() as Order[];
}

export function getOrderById(id: number): Order | undefined {
  return getDb()
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(id) as Order | undefined;
}

export function updateOrderStatus(
  id: number,
  status: "pending" | "fulfilled"
): void {
  getDb()
    .prepare("UPDATE orders SET status = ? WHERE id = ?")
    .run(status, id);
}
