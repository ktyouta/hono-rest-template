import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT, HTTP_STATUS } from "../../const";
import type { AppEnv } from "../../type";
import { ApiResponse } from "../../util";
import { createDbClient } from "../../infrastructure/db";
import { RefreshToken } from "../../domain";
import { RefreshUseCase } from "./usecase";

const refresh = new Hono<AppEnv>();

/**
 * 環境変数から有効期限（秒）を取得するヘルパー
 */
function parseExpires(expires: string): number {
  const match = expires.match(/^(\d+)([smhd])$/);
  if (!match) return 3600;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return 3600;
  }
}

/**
 * トークンリフレッシュ
 * @route POST /api/v1/refresh
 */
refresh.post(API_ENDPOINT.REFRESH, async (c) => {
  try {
    const db = createDbClient(c.env.DB);
    const useCase = new RefreshUseCase(db);

    const refreshTokenValue = getCookie(c, RefreshToken.COOKIE_KEY);
    const origin = c.req.header("Origin");
    const csrfToken = c.req.header("X-CSRF-Token");

    const accessTokenExpires = parseExpires(c.env.ACCESS_TOKEN_EXPIRES);
    const refreshTokenExpires = parseExpires(c.env.REFRESH_TOKEN_EXPIRES);
    const isProduction = c.env.ENV_PRODUCTION === "true";

    const result = await useCase.execute(
      refreshTokenValue,
      origin,
      csrfToken,
      {
        accessTokenJwtKey: c.env.ACCESS_TOKEN_JWT_KEY,
        accessTokenExpires,
        refreshTokenJwtKey: c.env.REFRESH_TOKEN_JWT_KEY,
        refreshTokenExpires,
        corsOrigin: c.env.CORS_ORIGIN,
      }
    );

    if (!result.success) {
      console.warn(`Refresh failed: ${result.message}`);

      // エラー時はCookieをクリア
      setCookie(
        c,
        RefreshToken.COOKIE_KEY,
        "",
        RefreshToken.getClearCookieOptions(isProduction)
      );

      return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
    }

    // 新しいリフレッシュトークンをCookieに設定
    setCookie(
      c,
      RefreshToken.COOKIE_KEY,
      result.data.refreshToken,
      RefreshToken.getCookieOptions(isProduction, refreshTokenExpires)
    );

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message,
      result.data.accessToken
    );
  } catch (e) {
    console.warn(`Refresh failed: ${e}`);
    const isProduction = c.env.ENV_PRODUCTION === "true";

    setCookie(
      c,
      RefreshToken.COOKIE_KEY,
      "",
      RefreshToken.getClearCookieOptions(isProduction)
    );

    return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
  }
});

export { refresh };
