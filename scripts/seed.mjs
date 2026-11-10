#!/usr/bin/env node
/**
 * 3M Tours & Travels ERP — Supabase seed script
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run db:seed
 *
 * The script generates the same realistic fictional dataset used by the local
 * demo (src/lib/seed-data.ts) and replaces the contents of the ERP tables.
 *
 * Requires Node 22.6+ for TypeScript type stripping.
 */
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { buildSeedData } from "../src/lib/seed-data.ts";

if (existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Older Node versions: fall back to shell-provided env vars.
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in .env.local or export them before running npm run db:seed.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function snakeize(value) {
  if (Array.isArray(value)) return value.map(snakeize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = snakeize(val);
    }
    return out;
  }
  return value;
}

const db = buildSeedData();

const TABLES = [
  ["app_settings", [{ id: 1, ...db.settings }]],
  ["customers", db.customers],
  ["tours", db.tours],
  ["hotels", db.hotels],
  ["visa_packages", db.visas],
  ["hajj_packages", db.hajjPackages],
  ["agents", db.agents],
  ["suppliers", db.suppliers],
  ["bookings", db.bookings],
  ["invoices", db.invoices],
  ["leads", db.leads],
  ["tasks", db.tasks],
  ["activities", db.activities],
];

async function main() {
  console.log(`Seeding ${new URL(url).hostname} …`);

  // Delete in reverse dependency order.
  for (const [table] of [...TABLES].reverse()) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`Clearing ${table}: ${error.message}`);
  }

  for (const [table, rows] of TABLES) {
    if (!rows.length) {
      console.log(`  ${table}: 0 rows`);
      continue;
    }
    const payload = rows.map((row) => snakeize(row));
    const chunkSize = 200;
    for (let index = 0; index < payload.length; index += chunkSize) {
      const chunk = payload.slice(index, index + chunkSize);
      const { error } = await supabase.from(table).insert(chunk);
      if (error) throw new Error(`Inserting ${table}: ${error.message}`);
    }
    console.log(`  ${table}: ${rows.length} rows`);
  }

  console.log("Done. The ERP is ready to use with Supabase.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
