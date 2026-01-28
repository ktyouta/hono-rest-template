import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../const";
import { RefreshToken } from "../../../domain";
import { createDbClient } from "../../../infrastructure/db";
import type { AppEnv } from "../../../type";
import { ApiResponse } from "../../../util";
import { AuthUseCase } from "../usecase/auth.usecase";


const auth = new Hono<AppEnv>();

/**
 * 認証チェック
 * @route GET /api/v1/auth
 */
auth.get(
    API_ENDPOINT.AUTH,
    async (c) => {
        try {

            const db = createDbClient(c.env.DB);
            const useCase = new AuthUseCase(db);
            const refreshToken = RefreshToken.get(getCookie(c, RefreshToken.COOKIE_KEY));

            const result = await useCase.execute(refreshToken);

            if (!result.success) {
                console.warn(`auth failed: ${result.message}`);

                // エラー時はCookieをクリア
                setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

                return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
            }

            return ApiResponse.create(c, result.status, result.message, result.data.accessToken);
        } catch (e) {
            console.warn(`Refresh failed: ${e}`);

            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.COOKIE_CLEAR_OPTION);

            return ApiResponse.create(c, HTTP_STATUS.UNAUTHORIZED, "認証失敗");
        }
    }
);

export { auth };

