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


const frontUserLogin = new Hono<AppEnv>();

/**
 * ログイン
 * @route POST /api/v1/frontUserLogin
 */
frontUserLogin.post(
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

        const result = await useCase.execute(body);

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
            RefreshToken.COOKIE_SET_OPTION
        );

        return ApiResponse.create(
            c,
            result.status as ContentfulStatusCode,
            result.message,
            result.data.response
        );
    }
);

export { frontUserLogin };
