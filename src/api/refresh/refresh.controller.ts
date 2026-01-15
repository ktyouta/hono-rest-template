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

        const result = await useCase.execute(refreshTokenValue, origin, csrfToken);

        if (!result.success) {
            console.warn(`Refresh failed: ${result.message}`);

            // エラー時はCookieをクリア
            setCookie(
                c,
                RefreshToken.COOKIE_KEY,
                "",
                RefreshToken.COOKIE_CLEAR_OPTION
            );

            return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
        }

        // 新しいリフレッシュトークンをCookieに設定
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
            result.data.accessToken
        );
    } catch (e) {
        console.warn(`Refresh failed: ${e}`);

        setCookie(
            c,
            RefreshToken.COOKIE_KEY,
            "",
            RefreshToken.COOKIE_CLEAR_OPTION
        );

        return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
    }
});

export { refresh };
