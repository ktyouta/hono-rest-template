import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteSampleUseCase } from "../../../../src/api/sample/usecase/delete-sample.usecase";
import { HTTP_STATUS } from "../../../../src/const";
import type { SampleService } from "../../../../src/api/sample/service/sample.service";


describe("DeleteSampleUseCase", () => {

    let mockService: SampleService;
    let useCase: DeleteSampleUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as SampleService;
        useCase = new DeleteSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプルを削除する", async () => {
            // Arrange
            (mockService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(true);

            // Act
            const result = await useCase.execute(1);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("サンプルを削除しました。");
        });

        it("異常系: サンプルが見つからない場合はエラーを返す", async () => {
            // Arrange
            (mockService.delete as ReturnType<typeof vi.fn>).mockResolvedValue(false);

            // Act
            const result = await useCase.execute(999);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("サンプルが見つかりません。");
        });
    });
});
