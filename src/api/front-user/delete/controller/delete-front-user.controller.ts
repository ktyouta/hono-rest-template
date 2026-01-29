import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { FrontUserId, RefreshToken } from "../../../../domain";
import { createDbClient } from "../../../../infrastructure/db";
import { authMiddleware, userOperationGuardMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { UserIdParamSchema } from "../../update/schema";
import { DeleteFrontUserUseCase } from "../usecase";


const deleteFrontUser = new Hono<AppEnv>();

/**
 * ユーザー削除
 * @route DELETE /api/v1/frontuser/:userId
 */
deleteFrontUser.delete(
    `${API_ENDPOINT.FRONT_USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return ApiResponse.create(c, HTTP_STATUS.BAD_REQUEST, "パラメータが不正です。", formatZodErrors(result.error));
        }
    }),
    async (c) => {

        const { userId } = c.req.valid("param");
        const db = createDbClient(c.env.DB);
        const useCase = new DeleteFrontUserUseCase(db);

        const result = await useCase.execute(FrontUserId.of(Number(userId)));

        if (!result.success) {
            return ApiResponse.create(c, result.status, result.message);
        }

        // リフレッシュトークンCookieをクリア
        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

        return c.body(null, HTTP_STATUS.NO_CONTENT);
    }
);

export { deleteFrontUser };

