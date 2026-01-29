import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import type { AppEnv } from "../../../type";
import { ApiResponse } from "../../../util";

const health = new Hono<AppEnv>();

/**
 * ヘルスチェックエンドポイント
 * @route GET /api/v1/health
 */
health.get(API_ENDPOINT.HEALTH, (c) => {
  return ApiResponse.create(c, HTTP_STATUS.OK, "OK", {
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export { health };

