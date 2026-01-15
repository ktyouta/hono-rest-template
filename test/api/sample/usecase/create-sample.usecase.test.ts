import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateSampleUseCase } from "../../../../src/api/sample/usecase/create-sample.usecase";
import { SampleEntity } from "../../../../src/api/sample/entity/sample.entity";
import { HTTP_STATUS } from "../../../../src/const";
import type { SampleService } from "../../../../src/api/sample/service/sample.service";


describe("CreateSampleUseCase", () => {

    let mockService: SampleService;
    let useCase: CreateSampleUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as unknown as SampleService;
        useCase = new CreateSampleUseCase(mockService);
    });

    describe("execute", () => {

        it("正常系: サンプルを作成する", async () => {
            // Arrange
            const input = {
                name: "New Sample",
                description: "New Description",
            };
            const createdEntity = new SampleEntity(1, input.name, input.description, new Date(), new Date());
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
            const createdEntity = new SampleEntity(1, input.name, null, new Date(), new Date());
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
