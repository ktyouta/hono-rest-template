import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetSampleUseCase } from "../../../../src/api/sample/usecase/get-sample.usecase";
import { SampleEntity } from "../../../../src/api/sample/entity/sample.entity";
import { HTTP_STATUS } from "../../../../src/const";
import type { SampleService } from "../../../../src/api/sample/service/sample.service";


describe("GetSampleUseCase", () => {

    let mockService: SampleService;
    let useCase: GetSampleUseCase;

    const mockEntity = new SampleEntity(1, "Sample 1", "Description 1", new Date(), new Date());

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as SampleService;
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
