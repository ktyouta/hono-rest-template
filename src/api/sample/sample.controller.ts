import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { API_ENDPOINT, HTTP_STATUS } from "../../const";
import type { AppEnv } from "../../type";
import { ApiResponse, formatZodErrors } from "../../util";
import { createDbClient } from "../../infrastructure/db";
import { SampleRepository } from "./repository";
import { SampleService } from "./service";
import {
  GetSamplesUseCase,
  GetSampleUseCase,
  CreateSampleUseCase,
  UpdateSampleUseCase,
  DeleteSampleUseCase,
} from "./usecase";
import {
  CreateSampleSchema,
  UpdateSampleSchema,
  SampleIdParamSchema,
} from "./schema";

const sample = new Hono<AppEnv>();

/**
 * サンプル一覧取得
 * @route GET /api/v1/samples
 */
sample.get(API_ENDPOINT.SAMPLE, async (c) => {
  const db = createDbClient(c.env.DB);
  const repository = new SampleRepository(db);
  const service = new SampleService(repository);
  const useCase = new GetSamplesUseCase(service);

  const result = await useCase.execute();

  return ApiResponse.create(
    c,
    result.status as ContentfulStatusCode,
    result.message,
    result.data
  );
});

/**
 * サンプル取得
 * @route GET /api/v1/samples/:id
 */
sample.get(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", SampleIdParamSchema, (result, c) => {
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
    const repository = new SampleRepository(db);
    const service = new SampleService(repository);
    const useCase = new GetSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    if (!result.success) {
      return ApiResponse.create(
        c,
        result.status as ContentfulStatusCode,
        result.message
      );
    }

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message,
      result.data
    );
  }
);

/**
 * サンプル作成
 * @route POST /api/v1/samples
 */
sample.post(
  API_ENDPOINT.SAMPLE,
  zValidator("json", CreateSampleSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "バリデーションエラー",
        formatZodErrors(result.error)
      );
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const repository = new SampleRepository(db);
    const service = new SampleService(repository);
    const useCase = new CreateSampleUseCase(service);

    const result = await useCase.execute(body);

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message,
      result.data
    );
  }
);

/**
 * サンプル更新
 * @route PUT /api/v1/samples/:id
 */
sample.put(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", SampleIdParamSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.BAD_REQUEST,
        "パラメータが不正です。",
        formatZodErrors(result.error)
      );
    }
  }),
  zValidator("json", UpdateSampleSchema, (result, c) => {
    if (!result.success) {
      return ApiResponse.create(
        c,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "バリデーションエラー",
        formatZodErrors(result.error)
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = createDbClient(c.env.DB);
    const repository = new SampleRepository(db);
    const service = new SampleService(repository);
    const useCase = new UpdateSampleUseCase(service);

    const result = await useCase.execute(Number(id), body);

    if (!result.success) {
      return ApiResponse.create(
        c,
        result.status as ContentfulStatusCode,
        result.message
      );
    }

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message,
      result.data
    );
  }
);

/**
 * サンプル削除
 * @route DELETE /api/v1/samples/:id
 */
sample.delete(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", SampleIdParamSchema, (result, c) => {
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
    const repository = new SampleRepository(db);
    const service = new SampleService(repository);
    const useCase = new DeleteSampleUseCase(service);

    const result = await useCase.execute(Number(id));

    return ApiResponse.create(
      c,
      result.status as ContentfulStatusCode,
      result.message
    );
  }
);

export { sample };
