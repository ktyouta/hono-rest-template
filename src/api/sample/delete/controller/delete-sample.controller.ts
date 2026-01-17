import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../const";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { createDbClient } from "../../../../infrastructure/db";
import { DeleteSampleRepository } from "../repository";
import { DeleteSampleService } from "../service";
import { DeleteSampleUseCase } from "../usecase";
import { DeleteSampleParamSchema } from "../schema";

const deleteSample = new Hono<AppEnv>();

/**
 * サンプル削除
 * @route DELETE /api/v1/sample/:id
 */
deleteSample.delete(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", DeleteSampleParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.BAD_REQUEST,
        "パラメータが不正です。",
        formatZodErrors(result.error)
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = createDbClient(c.env.DB);
    const repository = new DeleteSampleRepository(db);
    const service = new DeleteSampleService(repository);
    const useCase = new DeleteSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message
    );
  }
);

export { deleteSample };
