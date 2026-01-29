import type { MiddlewareHandler } from "hono";
import { HTTP_STATUS } from "../constant";
import type { AppEnv } from "../type";
import { ApiResponse } from "../util";

/**
 * ユーザー操作ガードミドルウェア
 * 環境変数でユーザー操作機能の有効/無効を制御
 */
export const userOperationGuardMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next
) => {
  const allowUserOperation = c.env.ALLOW_USER_OPERATION === "true";

  if (!allowUserOperation) {
    return ApiResponse.create(c, HTTP_STATUS.FORBIDDEN, "この機能は現在の環境では無効化されています。");
  }

  await next();
};
