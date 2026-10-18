import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __hivisPg?: ReturnType<typeof postgres>; __hivisDb?: Database };

export function getDb(): Database | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalForDb.__hivisPg) {
    globalForDb.__hivisPg = postgres(url, { prepare: false, max: 1 });
    globalForDb.__hivisDb = drizzle(globalForDb.__hivisPg, { schema });
  }
  return globalForDb.__hivisDb ?? null;
}
