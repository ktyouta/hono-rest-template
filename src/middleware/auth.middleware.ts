import type { MiddlewareHandler } from "hono";
import { AuthRepository, AuthService } from "../auth";
import { HTTP_STATUS } from "../constant";
import { AccessToken } from "../domain";
import { Header } from "../domain/header";
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

        const userId = await accessToken.getPayload();

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
