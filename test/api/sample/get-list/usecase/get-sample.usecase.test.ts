import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetListSampleEntity } from "../../../../../src/api/sample/get-list/entity/get-list-sample.entity";
import type { GetListSampleService } from "../../../../../src/api/sample/get-list/service/get-list-sample.service";
import { GetListSampleUseCase } from "../../../../../src/api/sample/get-list/usecase/get-list-sample.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";


describe("GetListSampleUseCase (get-list)", () => {

    let mockService: GetListSampleService;
    let useCase: GetListSampleUseCase;

    const mockEntities = [
        new GetListSampleEntity(1, "Sample 1", "Description 1", "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z"),
        new GetListSampleEntity(2, "Sample 2", "Description 2", "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z"),
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
        } as unknown as GetListSampleService;
        useCase = new GetListSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプル一覧を取得する", async () => {
            // Arrange
            (mockService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntities);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("サンプル一覧を取得しました。");
            expect(result.data).toHaveLength(2);
            expect(result.data[0].id).toBe(1);
            expect(result.data[0].name).toBe("Sample 1");
        });

        it("正常系: サンプルがない場合は空配列を返す", async () => {
            // Arrange
            (mockService.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("サンプル一覧を取得しました。");
            expect(result.data).toHaveLength(0);
        });
    });
});
