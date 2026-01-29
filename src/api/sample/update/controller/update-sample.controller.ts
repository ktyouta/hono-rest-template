import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { createDbClient } from "../../../../infrastructure/db";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { UpdateSampleRepository } from "../repository";
import { UpdateSampleParamSchema, UpdateSampleSchema } from "../schema";
import { UpdateSampleService } from "../service";
import { UpdateSampleUseCase } from "../usecase";

const updateSample = new Hono<AppEnv>();

/**
 * サンプル更新
 * @route PUT /api/v1/sample/:id
 */
updateSample.put(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", UpdateSampleParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(c, HTTP_STATUS.BAD_REQUEST, "パラメータが不正です。", formatZodErrors(result.error));
    }
  }),
  zValidator("json", UpdateSampleSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(c, HTTP_STATUS.UNPROCESSABLE_ENTITY, "バリデーションエラー", formatZodErrors(result.error));
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const repository = new UpdateSampleRepository(db);
    const service = new UpdateSampleService(repository);
    const useCase = new UpdateSampleUseCase(service);

    const result = await useCase.execute(Number(id), body);

    if (!result.success) {
      return ApiResponse.create(c, result.status, result.message);
    }

    return ApiResponse.create(c, result.status, result.message, result.data);
  }
);

export { updateSample };

