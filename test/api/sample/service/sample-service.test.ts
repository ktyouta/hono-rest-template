import { describe, it, expect, vi, beforeEach } from "vitest";
import { SampleEntity } from "../../../../src/api/sample/entity";
import { SampleService } from "../../../../src/api/sample/service";
import type { ISampleRepository } from "../../../../src/api/sample/repository";

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
