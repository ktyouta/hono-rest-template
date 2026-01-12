import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponseType } from "../type";

/**
 * APIレスポンスを生成するユーティリティ
 */
export class ApiResponse {
  /**
   * 統一されたAPIレスポンスを返す
   * @param c Honoコンテキスト
   * @param status HTTPステータスコード
   * @param message レスポンスメッセージ
   * @param data レスポンスデータ（任意）
   */
  static create<T>(
    c: Context,
    status: ContentfulStatusCode,
    message: string,
    data?: T
  ) {
    const responseBody: ApiResponseType<T> = {
      status,
      message,
    };

    if (data !== undefined) {
      responseBody.data = data;
    }

    return c.json(responseBody, status);
  }
}
