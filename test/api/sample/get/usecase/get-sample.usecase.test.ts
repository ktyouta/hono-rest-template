import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetSampleEntity } from "../../../../../src/api/sample/get/entity/get-sample.entity";
import type { GetSampleService } from "../../../../../src/api/sample/get/service/get-sample.service";
import { GetSampleUseCase } from "../../../../../src/api/sample/get/usecase/get-sample.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";


describe("GetSampleUseCase (get)", () => {

    let mockService: GetSampleService;
    let useCase: GetSampleUseCase;

    const mockEntity = new GetSampleEntity(1, "Sample 1", "Description 1", "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z");

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findById: vi.fn(),
        } as unknown as GetSampleService;
        useCase = new GetSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: 指定したIDのサンプルを取得する", async () => {
            // Arrange
            (mockService.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntity);

            // Act
            const result = await useCase.execute(1);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("サンプルを取得しました。");
            if (result.success) {
                expect(result.data.id).toBe(1);
                expect(result.data.name).toBe("Sample 1");
            }
        });

        it("異常系: サンプルが見つからない場合はエラーを返す", async () => {
            // Arrange
            (mockService.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            // Act
            const result = await useCase.execute(999);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("サンプルが見つかりません。");
        });
    });
});
