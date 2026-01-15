import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetSamplesUseCase } from "../../../../src/api/sample/usecase/get-samples.usecase";
import { SampleEntity } from "../../../../src/api/sample/entity/sample.entity";
import { HTTP_STATUS } from "../../../../src/const";
import type { SampleService } from "../../../../src/api/sample/service/sample.service";


describe("GetSamplesUseCase", () => {

    let mockService: SampleService;
    let useCase: GetSamplesUseCase;

    const mockEntities = [
        new SampleEntity(1, "Sample 1", "Description 1", new Date(), new Date()),
        new SampleEntity(2, "Sample 2", "Description 2", new Date(), new Date()),
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as SampleService;
        useCase = new GetSamplesUseCase(mockService);
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
