import { z } from "zod";

/**
 * サンプル作成リクエストスキーマ
 */
export const CreateSampleSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .optional(),
});

export type CreateSampleSchemaType = z.infer<typeof CreateSampleSchema>;

/**
 * サンプル更新リクエストスキーマ
 */
export const UpdateSampleSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください")
    .optional(),
  description: z
    .string()
    .max(500, "説明は500文字以内で入力してください")
    .optional(),
});

export type UpdateSampleSchemaType = z.infer<typeof UpdateSampleSchema>;

/**
 * サンプルIDパラメータスキーマ
 */
export const SampleIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "IDは数値で指定してください"),
});

export type SampleIdParamSchemaType = z.infer<typeof SampleIdParamSchema>;
