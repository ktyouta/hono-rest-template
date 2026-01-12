import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { setCookie } from "hono/cookie";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT, HTTP_STATUS } from "../../const";
import type { AppEnv } from "../../type";
import { ApiResponse, formatZodErrors } from "../../util";
import { createDbClient } from "../../infrastructure/db";
import { FrontUserId, RefreshToken } from "../../domain";
import { userOperationGuardMiddleware, authMiddleware } from "../../middleware";
import { CreateFrontUserSchema, CreateFrontUserUseCase } from "./create";
import {
  UpdateFrontUserSchema,
  UserIdParamSchema,
  UpdateFrontUserUseCase,
} from "./update";
import { DeleteFrontUserUseCase } from "./delete";

const frontuser = new Hono<AppEnv>();

/**
 * 環境変数から有効期限（秒）を取得するヘルパー
 */
function parseExpires(expires: string): number {
  const match = expires.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // デフォルト1時間

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
 * ユーザー作成
 * @route POST /api/v1/frontuser
 */
frontuser.post(
  API_ENDPOINT.FRONT_USER,
  userOperationGuardMiddleware,
  zValidator("json", CreateFrontUserSchema, (result, c) => {
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
    const useCase = new CreateFrontUserUseCase(db);

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

/**
 * ユーザー更新
 * @route PATCH /api/v1/frontuser/:userId
 */
frontuser.patch(
  `${API_ENDPOINT.FRONT_USER}/:userId`,
  userOperationGuardMiddleware,
  authMiddleware,
  zValidator("param", UserIdParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.BAD_REQUEST,
        "パラメータが不正です。",
        formatZodErrors(result.error)
      );
    }
  }),
  zValidator("json", UpdateFrontUserSchema, (result, c) => {
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
    const { userId } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const useCase = new UpdateFrontUserUseCase(db);

    const refreshTokenExpires = parseExpires(c.env.REFRESH_TOKEN_EXPIRES);
    const isProduction = c.env.ENV_PRODUCTION === "true";

    const result = await useCase.execute(FrontUserId.of(Number(userId)), body, {
      refreshTokenJwtKey: c.env.REFRESH_TOKEN_JWT_KEY,
      refreshTokenExpires,
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

/**
 * ユーザー削除
 * @route DELETE /api/v1/frontuser/:userId
 */
frontuser.delete(
  `${API_ENDPOINT.FRONT_USER}/:userId`,
  userOperationGuardMiddleware,
  authMiddleware,
  zValidator("param", UserIdParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.BAD_REQUEST,
        "パラメータが不正です。",
        formatZodErrors(result.error)
      );
    }
  }),
  async (c) => {
    const { userId } = c.req.valid("param");
    const db = createDbClient(c.env.DB);
    const useCase = new DeleteFrontUserUseCase(db);
    const isProduction = c.env.ENV_PRODUCTION === "true";

    const result = await useCase.execute(FrontUserId.of(Number(userId)));

    if (!result.success) {
      return ApiResponse.create(
        c,
        result.status as ContentfulStatusCode,
        result.message
      );
    }

    // リフレッシュトークンCookieをクリア
    setCookie(
      c,
      RefreshToken.COOKIE_KEY,
      "",
      RefreshToken.getClearCookieOptions(isProduction)
    );

    return c.body(null, HTTP_STATUS.NO_CONTENT);
  }
);

export { frontuser };
