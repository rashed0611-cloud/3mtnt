import { JsonRepository } from "@/lib/db/json-repo";
import { SupabaseRepository } from "@/lib/db/supabase-repo";
import type { Repository } from "@/lib/db/types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

let instance: Repository | null = null;

export function getRepository(): Repository {
  if (instance) return instance;
  instance = isSupabaseConfigured() ? new SupabaseRepository() : new JsonRepository();
  return instance;
}

export type { Repository };
