import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

/**
 * Drizzle D1クライアントを生成する
 * @param d1 D1Databaseインスタンス
 */
export function createDbClient(d1: D1Database): Database {
  return drizzle(d1, { schema });
}
