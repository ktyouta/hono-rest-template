import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateFrontUserUseCase } from "../../../../../src/api/front-user/update/usecase/update-front-user.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";
import { FrontUserId } from "../../../../../src/domain";
import type { Database } from "../../../../../src/infrastructure/db";


// モック
vi.mock("../../../../../src/api/front-user/update/repository", () => ({
    UpdateFrontUserRepository: vi.fn(),
}));

vi.mock("../../../../../src/api/front-user/update/service", () => ({
    UpdateFrontUserService: vi.fn().mockImplementation(() => ({
        checkUserNameExists: vi.fn(),
        updateFrontLoginUser: vi.fn(),
        updateFrontUser: vi.fn(),
    })),
}));

vi.mock("../../../../../src/config", () => ({
    envConfig: {
        refreshTokenJwtKey: "test-refresh-key",
        refreshTokenExpires: "7d",
    },
}));

vi.mock("../../../../../src/domain/refresh-token/refresh-token", () => ({
    RefreshToken: {
        create: vi.fn().mockResolvedValue({ value: "mock-refresh-token" }),
    },
}));


describe("UpdateFrontUserUseCase", () => {

    let mockDb: Database;
    let useCase: UpdateFrontUserUseCase;

    const validUserId = FrontUserId.of(1);
    const validRequestBody = {
        userName: "updateduser",
        userBirthday: "19900101",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new UpdateFrontUserUseCase(mockDb);
    });

    describe("execute", () => {

        it("正常系: ユーザー更新に成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.checkUserNameExists = vi.fn().mockResolvedValue(false);
            mockService.updateFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockService.updateFrontUser = vi.fn().mockResolvedValue({
                userId: 1,
                userName: "updateduser",
                userBirthday: "19900101",
            });

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("ユーザー情報の更新が完了しました。");
            if (result.success) {
                expect(result.data.response).toBeDefined();
                expect(result.data.refreshToken).toBe("mock-refresh-token");
            }
        });

        it("異常系: ユーザー名が重複している場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.checkUserNameExists = vi.fn().mockResolvedValue(true);

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
            expect(result.message).toBe("既にユーザーが存在しています。");
        });

        it("異常系: ユーザーが見つからない場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.checkUserNameExists = vi.fn().mockResolvedValue(false);
            mockService.updateFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockService.updateFrontUser = vi.fn().mockResolvedValue(null);

            // Act
            const result = await useCase.execute(validUserId, validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("ユーザーが見つかりません。");
        });
    });
});
