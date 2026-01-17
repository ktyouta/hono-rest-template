import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT } from "../../../../const";
import type { AppEnv } from "../../../../type";
import { ApiResponse } from "../../../../util";
import { createDbClient } from "../../../../infrastructure/db";
import { GetListSampleRepository } from "../repository";
import { GetListSampleService } from "../service";
import { GetListSampleUseCase } from "../usecase";

const getListSample = new Hono<AppEnv>();

/**
 * サンプル一覧取得
 * @route GET /api/v1/sample
 */
getListSample.get(API_ENDPOINT.SAMPLE, async (c) => {
  const db = createDbClient(c.env.DB);
  const repository = new GetListSampleRepository(db);
  const service = new GetListSampleService(repository);
  const useCase = new GetListSampleUseCase(service);

  const result = await useCase.execute();

  return ApiResponse.create(
    c,
    result.status as ContentfulStatusCode,
    result.message,
    result.data
  );
});

export { getListSample };
