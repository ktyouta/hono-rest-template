import type { NotFoundHandler } from "hono";
import { HTTP_STATUS } from "../const";
import type { AppEnv } from "../type";

/**
 * 404ハンドラー
 */
export const notFoundHandler: NotFoundHandler<AppEnv> = (c) => {
  return c.json(
    {
      status: HTTP_STATUS.NOT_FOUND,
      message: "Not Found",
    },
    HTTP_STATUS.NOT_FOUND
  );
};
