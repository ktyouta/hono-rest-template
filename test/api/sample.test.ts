import { describe, it, expect, vi, beforeEach } from "vitest";
import { SampleEntity } from "../../src/api/sample/entity";
import { SampleResponseDto, SampleListResponseDto } from "../../src/api/sample/dto";
import { SampleService } from "../../src/api/sample/service";
import { GetSamplesUseCase, GetSampleUseCase, CreateSampleUseCase } from "../../src/api/sample/usecase";
import { CreateSampleSchema, UpdateSampleSchema } from "../../src/api/sample/schema";
import type { ISampleRepository } from "../../src/api/sample/repository";

describe("Sample Schema Validation", () => {
  describe("CreateSampleSchema", () => {
    it("正常なデータでバリデーションを通過すること", () => {
      const result = CreateSampleSchema.safeParse({
        name: "テストサンプル",
        description: "説明文",
      });
      expect(result.success).toBe(true);
    });

    it("名前が空の場合にエラーになること", () => {
      const result = CreateSampleSchema.safeParse({
        name: "",
        description: "説明文",
      });
      expect(result.success).toBe(false);
    });

    it("名前が100文字を超える場合にエラーになること", () => {
      const result = CreateSampleSchema.safeParse({
        name: "a".repeat(101),
        description: "説明文",
      });
      expect(result.success).toBe(false);
    });

    it("説明が省略可能であること", () => {
      const result = CreateSampleSchema.safeParse({
        name: "テストサンプル",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateSampleSchema", () => {
    it("部分更新が可能であること", () => {
      const result = UpdateSampleSchema.safeParse({
        name: "更新後の名前",
      });
      expect(result.success).toBe(true);
    });

    it("空のオブジェクトでもバリデーションを通過すること", () => {
      const result = UpdateSampleSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

describe("SampleEntity", () => {
  it("fromRecordでエンティティを生成できること", () => {
    const record = {
      id: 1,
      name: "テスト",
      description: "説明",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    const entity = SampleEntity.fromRecord(record);

    expect(entity.id).toBe(1);
    expect(entity.name).toBe("テスト");
    expect(entity.description).toBe("説明");
  });
});

describe("SampleResponseDto", () => {
  it("エンティティからDTOを生成できること", () => {
    const entity = new SampleEntity(
      1,
      "テスト",
      "説明",
      "2024-01-01T00:00:00.000Z",
      "2024-01-01T00:00:00.000Z"
    );

    const dto = new SampleResponseDto(entity);

    expect(dto.value.id).toBe(1);
    expect(dto.value.name).toBe("テスト");
    expect(dto.value.description).toBe("説明");
  });
});

describe("SampleListResponseDto", () => {
  it("エンティティ配列からDTO配列を生成できること", () => {
    const entities = [
      new SampleEntity(1, "テスト1", "説明1", "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z"),
      new SampleEntity(2, "テスト2", null, "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z"),
    ];

    const dto = new SampleListResponseDto(entities);

    expect(dto.value).toHaveLength(2);
    expect(dto.value[0].name).toBe("テスト1");
    expect(dto.value[1].name).toBe("テスト2");
    expect(dto.value[1].description).toBeNull();
  });
});

describe("SampleService", () => {
  let mockRepository: ISampleRepository;
  let service: SampleService;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new SampleService(mockRepository);
  });

  it("findAll - 全件取得できること", async () => {
    vi.mocked(mockRepository.findAll).mockResolvedValue([
      {
        id: 1,
        name: "テスト",
        description: "説明",
        deleteFlg: "0",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(SampleEntity);
  });

  it("findById - 存在する場合にエンティティを返すこと", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({
      id: 1,
      name: "テスト",
      description: "説明",
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    const result = await service.findById(1);

    expect(result).toBeInstanceOf(SampleEntity);
    expect(result?.id).toBe(1);
  });

  it("findById - 存在しない場合にnullを返すこと", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(undefined);

    const result = await service.findById(999);

    expect(result).toBeNull();
  });
});

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
