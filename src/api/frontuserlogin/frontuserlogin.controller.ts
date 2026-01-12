import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { setCookie } from "hono/cookie";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT, HTTP_STATUS } from "../../const";
import type { AppEnv } from "../../type";
import { ApiResponse, formatZodErrors } from "../../util";
import { createDbClient } from "../../infrastructure/db";
import { RefreshToken } from "../../domain";
import { FrontUserLoginSchema, FrontUserLoginUseCase } from "./";

const frontuserlogin = new Hono<AppEnv>();

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
 * ログイン
 * @route POST /api/v1/frontuserlogin
 */
frontuserlogin.post(
  API_ENDPOINT.FRONT_USER_LOGIN,
  zValidator("json", FrontUserLoginSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "バリデーションエラー",
        formatZodErrors(result.error)
      );
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const useCase = new FrontUserLoginUseCase(db);

    const accessTokenExpires = parseExpires(c.env.ACCESS_TOKEN_EXPIRES);
    const refreshTokenExpires = parseExpires(c.env.REFRESH_TOKEN_EXPIRES);
    const isProduction = c.env.ENV_PRODUCTION === "true";

    const result = await useCase.execute(body, {
      accessTokenJwtKey: c.env.ACCESS_TOKEN_JWT_KEY,
      accessTokenExpires,
      refreshTokenJwtKey: c.env.REFRESH_TOKEN_JWT_KEY,
      refreshTokenExpires,
      pepper: c.env.PEPPER,
    });

    if (!result.success) {
      return ApiResponse.create(
        c,
        result.status as ContentfulStatusCode,
        result.message
      );
    }

    // リフレッシュトークンをCookieに設定
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
      result.data.response
    );
  }
);

export { frontuserlogin };
