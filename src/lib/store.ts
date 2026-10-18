import { memoryStore, type Store } from "@/lib/memory-store";
import { createPostgresStore } from "@/lib/pg-store";

let postgresStore: Store | null = null;

export function getStore(options?: { memory?: boolean }): Store {
  if (options?.memory || !process.env.DATABASE_URL) return memoryStore;
  if (!postgresStore) postgresStore = createPostgresStore();
  return postgresStore;
}

export type { Store };
