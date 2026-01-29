import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { createDbClient } from "../../../../infrastructure/db";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { GetSampleRepository } from "../repository";
import { GetSampleParamSchema } from "../schema";
import { GetSampleService } from "../service";
import { GetSampleUseCase } from "../usecase";

const getSampleById = new Hono<AppEnv>();

/**
 * サンプル取得
 * @route GET /api/v1/sample/:id
 */
getSampleById.get(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", GetSampleParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(c, HTTP_STATUS.BAD_REQUEST, "パラメータが不正です。", formatZodErrors(result.error));
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const db = createDbClient(c.env.DB);
    const repository = new GetSampleRepository(db);
    const service = new GetSampleService(repository);
    const useCase = new GetSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    if (!result.success) {
      return ApiResponse.create(c, result.status, result.message);
    }

    return ApiResponse.create(c, result.status, result.message, result.data);
  }
);

export { getSampleById };

