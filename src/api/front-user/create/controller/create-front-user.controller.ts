import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { RefreshToken } from "../../../../domain";
import { createDbClient } from "../../../../infrastructure/db";
import { userOperationGuardMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { CreateFrontUserSchema } from "../schema";
import { CreateFrontUserUseCase } from "../usecase";


const createFrontUser = new Hono<AppEnv>();

/**
 * ユーザー作成
 * @route POST /api/v1/frontuser
 */
createFrontUser.post(
    API_ENDPOINT.FRONT_USER,
    userOperationGuardMiddleware,
    zValidator("json", CreateFrontUserSchema, (result, c) => {
        if (!result.success) {
            return ApiResponse.create(c, HTTP_STATUS.UNPROCESSABLE_ENTITY, "バリデーションエラー", formatZodErrors(result.error));
        }
    }),
    async (c) => {

        const body = c.req.valid("json");
        const db = createDbClient(c.env.DB);
        const useCase = new CreateFrontUserUseCase(db);

        const result = await useCase.execute(body);

        if (!result.success) {
            return ApiResponse.create(c, result.status, result.message);
        }

        // リフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, result.data.refreshToken, RefreshToken.COOKIE_SET_OPTION);

        return ApiResponse.create(c, result.status, result.message, result.data.response);
    }
);

export { createFrontUser };

