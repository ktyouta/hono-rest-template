import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { FrontUserId, RefreshToken } from "../../../../domain";
import { createDbClient } from "../../../../infrastructure/db";
import { authMiddleware, userOperationGuardMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { UpdateFrontUserSchema, UserIdParamSchema } from "../schema";
import { UpdateFrontUserUseCase } from "../usecase";


const updateFrontUser = new Hono<AppEnv>();

/**
 * ユーザー更新
 * @route PATCH /api/v1/frontuser/:userId
 */
updateFrontUser.patch(
    `${API_ENDPOINT.FRONT_USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return ApiResponse.create(c, HTTP_STATUS.BAD_REQUEST, "パラメータが不正です。", formatZodErrors(result.error));
        }
    }),
    zValidator("json", UpdateFrontUserSchema, (result, c) => {
        if (!result.success) {
            return ApiResponse.create(c, HTTP_STATUS.UNPROCESSABLE_ENTITY, "バリデーションエラー", formatZodErrors(result.error));
        }
    }),
    async (c) => {

        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = createDbClient(c.env.DB);
        const useCase = new UpdateFrontUserUseCase(db);

        const result = await useCase.execute(FrontUserId.of(Number(userId)), body);

        if (!result.success) {
            return ApiResponse.create(c, result.status, result.message);
        }

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, result.data.refreshToken, RefreshToken.COOKIE_SET_OPTION);

        return ApiResponse.create(c, result.status, result.message, result.data.response);
    }
);

export { updateFrontUser };

