import type { Context, Next } from "hono";
import type { AppEnv } from "../type";
import { envConfig } from "../config";


let initialized = false;

/**
 * 環境変数初期化ミドルウェア
 */
export const envInitMiddleware = async (c: Context<AppEnv>, next: Next) => {

    if (!initialized) {
        envConfig.init(c.env);
        initialized = true;
    }

    await next();
};
