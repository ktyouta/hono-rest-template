import type { ZodError } from "zod";
import type { ValidationErrorType } from "../type";

/**
 * Zodエラーをフォーマットする
 * @param errors Zodエラー
 */
export function formatZodErrors(errors: ZodError): ValidationErrorType[] {
  return errors.errors.map((error) => ({
    field: error.path.join("."),
    message: error.message,
  }));
}
