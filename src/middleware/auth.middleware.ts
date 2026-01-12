import { Header } from "../domain/header";
import type { MiddlewareHandler } from "hono";
import { AuthRepository, AuthService } from "../auth";
import { HTTP_STATUS } from "../const";
import { AccessToken } from "../domain";
import { createDbClient } from "../infrastructure/db";
import type { AppEnv } from "../type";
import { ApiResponse } from "../util";

/**
 * 認証ミドルウェア
 */
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    const header = new Header(c.req.raw);
    const accessToken = AccessToken.get(header);

    const jwtKey = c.env.ACCESS_TOKEN_JWT_KEY;
    const userId = await accessToken.getPayload(jwtKey);

    const db = createDbClient(c.env.DB);
    const repository = new AuthRepository(db);
    const service = new AuthService(repository);

    const userInfo = await service.getUserById(userId);

    if (!userInfo) {
      return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証エラー");
    }

    c.set("user", {
      userId,
      info: {
        userId: userInfo.userId,
        userName: userInfo.userName,
        birthday: userInfo.userBirthday,
      },
    });

    await next();
  } catch (err) {
    console.error("Auth error:", err);
    return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証エラー");
  }
};
