import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { createDbClient } from "../../../../infrastructure/db";
import type { AppEnv } from "../../../../type";
import { ApiResponse, formatZodErrors } from "../../../../util";
import { CreateSampleRepository } from "../repository";
import { CreateSampleSchema } from "../schema";
import { CreateSampleService } from "../service";
import { CreateSampleUseCase } from "../usecase";

const createSample = new Hono<AppEnv>();

/**
 * サンプル作成
 * @route POST /api/v1/sample
 */
createSample.post(
  API_ENDPOINT.SAMPLE,
  zValidator("json", CreateSampleSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(c, HTTP_STATUS.UNPROCESSABLE_ENTITY, "バリデーションエラー", formatZodErrors(result.error));
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const repository = new CreateSampleRepository(db);
    const service = new CreateSampleService(repository);
    const useCase = new CreateSampleUseCase(service);

    const result = await useCase.execute(body);

    return ApiResponse.create(c, result.status, result.message, result.data);
  }
);

export { createSample };

