import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateFrontUserUseCase } from "../../../../../src/api/front-user/create/usecase/create-front-user.usecase";
import { HTTP_STATUS } from "../../../../../src/constant";
import { FrontUserId } from "../../../../../src/domain";
import type { Database } from "../../../../../src/infrastructure/db";


// モック
vi.mock("../../../../../src/api/front-user/create/repository", () => ({
    CreateFrontUserRepository: vi.fn(),
}));

vi.mock("../../../../../src/api/front-user/create/service", () => ({
    CreateFrontUserService: vi.fn().mockImplementation(() => ({
        checkUserNameExists: vi.fn(),
        createUserId: vi.fn(),
        insertFrontLoginUser: vi.fn(),
        insertFrontUser: vi.fn(),
    })),
}));

vi.mock("../../../../../src/config", () => ({
    envConfig: {
        pepper: "test-pepper",
        accessTokenJwtKey: "test-access-key",
        accessTokenExpires: "1h",
        refreshTokenJwtKey: "test-refresh-key",
        refreshTokenExpires: "7d",
    },
}));

vi.mock("../../../../../src/domain/access-token/access-token", () => ({
    AccessToken: {
        create: vi.fn().mockResolvedValue({ token: "mock-access-token" }),
    },
}));

vi.mock("../../../../../src/domain/refresh-token/refresh-token", () => ({
    RefreshToken: {
        create: vi.fn().mockResolvedValue({ value: "mock-refresh-token" }),
    },
}));

vi.mock("../../../../../src/domain/front-user-password/front-user-password", () => ({
    FrontUserPassword: {
        hash: vi.fn().mockResolvedValue({ value: "hashed-password" }),
    },
}));

vi.mock("../../../../../src/domain/front-user-salt/front-user-salt", () => ({
    FrontUserSalt: {
        generate: vi.fn().mockReturnValue({ value: "generated-salt" }),
    },
}));


describe("CreateFrontUserUseCase", () => {

    let mockDb: Database;
    let useCase: CreateFrontUserUseCase;

    const validRequestBody = {
        userName: "testuser",
        password: "password123",
        userBirthday: "19900101",
        confirmPassword: "password123",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new CreateFrontUserUseCase(mockDb);
    });

    describe("execute", () => {

        it("正常系: ユーザー作成に成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.checkUserNameExists = vi.fn().mockResolvedValue(false);
            mockService.createUserId = vi.fn().mockResolvedValue(FrontUserId.of(1));
            mockService.insertFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockService.insertFrontUser = vi.fn().mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.CREATED);
            expect(result.message).toBe("ユーザー情報の登録が完了しました。");
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
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
            expect(result.message).toBe("既にユーザーが存在しています。");
        });
    });
});
