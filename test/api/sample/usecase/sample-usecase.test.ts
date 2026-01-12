import { describe, it, expect, vi } from "vitest";
import { SampleService } from "../../../../src/api/sample/service";
import { GetSamplesUseCase, GetSampleUseCase, CreateSampleUseCase } from "../../../../src/api/sample/usecase";
import type { ISampleRepository } from "../../../../src/api/sample/repository";

describe("GetSamplesUseCase", () => {
  it("サンプル一覧を取得できること", async () => {
    const mockRepository: ISampleRepository = {
      findAll: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: "テスト",
          description: "説明",
          deleteFlg: "0",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ]),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const service = new SampleService(mockRepository);
    const useCase = new GetSamplesUseCase(service);

    const result = await useCase.execute();

    expect(result.status).toBe(200);
    expect(result.data).toHaveLength(1);
  });
});

describe("GetSampleUseCase", () => {
  it("存在するサンプルを取得できること", async () => {
    const mockRepository: ISampleRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: 1,
        name: "テスト",
        description: "説明",
        deleteFlg: "0",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const service = new SampleService(mockRepository);
    const useCase = new GetSampleUseCase(service);

    const result = await useCase.execute(1);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
  });

  it("存在しないサンプルで404を返すこと", async () => {
    const mockRepository: ISampleRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const service = new SampleService(mockRepository);
    const useCase = new GetSampleUseCase(service);

    const result = await useCase.execute(999);

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });
});

describe("CreateSampleUseCase", () => {
  it("サンプルを作成できること", async () => {
    const mockRepository: ISampleRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: 1,
        name: "新規サンプル",
        description: "説明",
        deleteFlg: "0",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const service = new SampleService(mockRepository);
    const useCase = new CreateSampleUseCase(service);

    const result = await useCase.execute({
      name: "新規サンプル",
      description: "説明",
    });

    expect(result.status).toBe(201);
    expect(result.data.name).toBe("新規サンプル");
  });
});
