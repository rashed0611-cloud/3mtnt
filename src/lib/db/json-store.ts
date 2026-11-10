import { promises as fs } from "fs";
import path from "path";
import { buildSeedData } from "@/lib/seed-data";
import type { Database } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

let cache: Database | null = null;

async function readFile(): Promise<Database | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Database;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<Database> {
  if (cache) return cache;
  const existing = await readFile();
  if (existing) {
    cache = existing;
    return existing;
  }
  const seeded = buildSeedData();
  cache = seeded;
  await persist(seeded);
  return seeded;
}

export async function saveDb(db: Database): Promise<void> {
  cache = db;
  await persist(db);
}

async function persist(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function resetDb(): Promise<Database> {
  const seeded = buildSeedData();
  cache = seeded;
  await persist(seeded);
  return seeded;
}
