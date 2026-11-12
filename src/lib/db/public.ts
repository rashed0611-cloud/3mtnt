import "server-only";

import { getRepository } from "@/lib/db";
import { buildSeedData } from "@/lib/seed-data";
import { normalizeSettings } from "@/lib/settings-defaults";
import type { AppSettings, Database } from "@/lib/types";

/**
 * Public pages must not go down because a remote database query failed.
 *
 * The workspace is the source of truth, but the storefront can always render a
 * complete, sensible site from the local seed snapshot. This keeps marketing
 * pages and the public flight search online during a Supabase timeout while the
 * admin area continues to require the live database.
 */
export async function getPublicDatabase(): Promise<Database> {
  try {
    return await getRepository().getDatabase();
  } catch {
    return buildSeedData();
  }
}

export async function getPublicSettings(): Promise<AppSettings> {
  try {
    return await getRepository().getSettings();
  } catch {
    return normalizeSettings(buildSeedData().settings);
  }
}
