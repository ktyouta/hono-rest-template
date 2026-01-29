import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateSampleEntity } from "../../../../../src/api/sample/create/entity/create-sample.entity";
import type { CreateSampleService } from "../../../../../src/api/sample/create/service/create-sample.service";
import { CreateSampleUseCase } from "../../../../../src/api/sample/create/usecase/create-sample.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";


describe("CreateSampleUseCase", () => {

    let mockService: CreateSampleService;
    let useCase: CreateSampleUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            create: vi.fn(),
        } as unknown as CreateSampleService;
        useCase = new CreateSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプルを作成する", async () => {
            // Arrange
            const input = {
                name: "New Sample",
                description: "New Description",
            };
            const createdEntity = new CreateSampleEntity(1, input.name, input.description, "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z");
            (mockService.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdEntity);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.status).toBe(HTTP_STATUS.CREATED);
            expect(result.message).toBe("サンプルを作成しました。");
            expect(result.data.id).toBe(1);
            expect(result.data.name).toBe("New Sample");
            expect(result.data.description).toBe("New Description");
        });

        it("正常系: descriptionなしでサンプルを作成する", async () => {
            // Arrange
            const input = {
                name: "New Sample",
            };
            const createdEntity = new CreateSampleEntity(1, input.name, null, "2024-01-01T00:00:00.000Z", "2024-01-01T00:00:00.000Z");
            (mockService.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdEntity);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.status).toBe(HTTP_STATUS.CREATED);
            expect(result.message).toBe("サンプルを作成しました。");
            expect(result.data.id).toBe(1);
            expect(result.data.name).toBe("New Sample");
            expect(result.data.description).toBeNull();
        });
    });
});
