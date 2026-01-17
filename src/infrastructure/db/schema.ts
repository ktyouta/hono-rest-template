import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * サンプルテーブルスキーマ
 */
export const sample = sqliteTable("sample", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  deleteFlg: text("delete_flg").notNull().default("0"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Sample = typeof sample.$inferSelect;
export type NewSample = typeof sample.$inferInsert;

/**
 * フロントユーザーマスタ
 */
export const frontUserMaster = sqliteTable("front_user_master", {
  userId: integer("user_id").primaryKey(),
  userName: text("user_name").notNull().unique(),
  userBirthday: text("user_birthday").notNull(),
  lastLoginDate: text("last_login_date"),
  deleteFlg: text("delete_flg").notNull().default("0"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type FrontUserMaster = typeof frontUserMaster.$inferSelect;
export type NewFrontUserMaster = typeof frontUserMaster.$inferInsert;

/**
 * フロントユーザーログインマスタ
 */
export const frontUserLoginMaster = sqliteTable("front_user_login_master", {
  userId: integer("user_id").primaryKey(),
  userName: text("user_name").notNull().unique(),
  password: text("password").notNull(),
  salt: text("salt").notNull(),
  deleteFlg: text("delete_flg").notNull().default("0"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type FrontUserLoginMaster = typeof frontUserLoginMaster.$inferSelect;
export type NewFrontUserLoginMaster = typeof frontUserLoginMaster.$inferInsert;

/**
 * シーケンスマスタ（ID採番用）
 */
export const seqMaster = sqliteTable("seq_master", {
  key: text("key").primaryKey(),
  nextId: integer("next_id").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type SeqMaster = typeof seqMaster.$inferSelect;
export type NewSeqMaster = typeof seqMaster.$inferInsert;
