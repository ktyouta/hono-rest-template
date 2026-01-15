import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateSampleUseCase } from "../../../../src/api/sample/usecase/update-sample.usecase";
import { SampleEntity } from "../../../../src/api/sample/entity/sample.entity";
import { HTTP_STATUS } from "../../../../src/const";
import type { SampleService } from "../../../../src/api/sample/service/sample.service";


describe("UpdateSampleUseCase", () => {

    let mockService: SampleService;
    let useCase: UpdateSampleUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as SampleService;
        useCase = new UpdateSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプルを更新する", async () => {
            // Arrange
            const input = {
                name: "Updated Sample",
                description: "Updated Description",
            };
            const updatedEntity = new SampleEntity(1, input.name, input.description, new Date(), new Date());
            (mockService.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedEntity);

            // Act
            const result = await useCase.execute(1, input);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("サンプルを更新しました。");
            if (result.success) {
                expect(result.data.id).toBe(1);
                expect(result.data.name).toBe("Updated Sample");
                expect(result.data.description).toBe("Updated Description");
            }
        });

        it("正常系: 名前のみ更新する", async () => {
            // Arrange
            const input = {
                name: "Updated Name Only",
            };
            const updatedEntity = new SampleEntity(1, input.name, "Original Description", new Date(), new Date());
            (mockService.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedEntity);

            // Act
            const result = await useCase.execute(1, input);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            if (result.success) {
                expect(result.data.name).toBe("Updated Name Only");
            }
        });

        it("異常系: サンプルが見つからない場合はエラーを返す", async () => {
            // Arrange
            const input = {
                name: "Updated Sample",
            };
            (mockService.update as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            // Act
            const result = await useCase.execute(999, input);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("サンプルが見つかりません。");
        });
    });
});
