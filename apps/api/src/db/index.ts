import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Env } from "../env";
import * as schema from "./schema";

export function createDb(env: Env) {
  const sql = neon(env.NEON_DATABASE_URL);
  return drizzle(sql, { schema });
}

export { schema };
