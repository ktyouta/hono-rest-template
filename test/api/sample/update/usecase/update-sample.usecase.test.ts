import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateSampleEntity } from "../../../../../src/api/sample/update/entity/update-sample.entity";
import type { UpdateSampleService } from "../../../../../src/api/sample/update/service/update-sample.service";
import { UpdateSampleUseCase } from "../../../../../src/api/sample/update/usecase/update-sample.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";


describe("UpdateSampleUseCase", () => {

    let mockService: UpdateSampleService;
    let useCase: UpdateSampleUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            update: vi.fn(),
        } as unknown as UpdateSampleService;
        useCase = new UpdateSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプルを更新する", async () => {
            // Arrange
            const input = {
                name: "Updated Sample",
                description: "Updated Description",
            };
            const updatedEntity = new UpdateSampleEntity(1, input.name, input.description, "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z");
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
            const updatedEntity = new UpdateSampleEntity(1, input.name, "Original Description", "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z");
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
