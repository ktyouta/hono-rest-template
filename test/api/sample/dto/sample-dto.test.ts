import { describe, it, expect } from "vitest";
import { SampleEntity } from "../../../../src/api/sample/entity";
import { SampleResponseDto, SampleListResponseDto } from "../../../../src/api/sample/dto";

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
