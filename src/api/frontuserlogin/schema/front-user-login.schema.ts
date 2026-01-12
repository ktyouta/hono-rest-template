import { z } from "zod";

/**
 * ログインリクエストスキーマ
 */
export const FrontUserLoginSchema = z.object({
  userName: z.string().min(1, "ユーザー名を入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type FrontUserLoginSchemaType = z.infer<typeof FrontUserLoginSchema>;
