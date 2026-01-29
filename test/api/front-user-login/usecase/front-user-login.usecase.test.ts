import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontUserLoginUseCase } from "../../../../src/api/front-user-login/usecase/front-user-login.usecase";
import { HTTP_STATUS } from "../../../../src/constant";
import type { Database } from "../../../../src/infrastructure/db";


// モック
vi.mock("../../../../src/api/front-user-login/repository", () => ({
    FrontUserLoginRepository: vi.fn(),
}));

vi.mock("../../../../src/api/front-user-login/service", () => ({
    FrontUserLoginService: vi.fn().mockImplementation(() => ({
        getLoginUser: vi.fn(),
        getUserInfo: vi.fn(),
        updateLastLoginDate: vi.fn(),
    })),
}));

vi.mock("../../../../src/config", () => ({
    envConfig: {
        pepper: "test-pepper",
        accessTokenJwtKey: "test-access-key",
        accessTokenExpires: "1h",
        refreshTokenJwtKey: "test-refresh-key",
        refreshTokenExpires: "7d",
    },
}));

vi.mock("../../../../src/domain/access-token/access-token", () => ({
    AccessToken: {
        create: vi.fn().mockResolvedValue({ token: "mock-access-token" }),
    },
}));

vi.mock("../../../../src/domain/refresh-token/refresh-token", () => ({
    RefreshToken: {
        create: vi.fn().mockResolvedValue({ value: "mock-refresh-token" }),
    },
}));

vi.mock("../../../../src/domain/front-user-password/front-user-password", () => ({
    FrontUserPassword: {
        hash: vi.fn().mockResolvedValue({ value: "hashed-password" }),
    },
}));


describe("FrontUserLoginUseCase", () => {

    let mockDb: Database;
    let useCase: FrontUserLoginUseCase;

    const validRequestBody = {
        userName: "testuser",
        password: "password123",
    };

    const mockLoginInfo = {
        userId: 1,
        salt: "test-salt",
        password: "hashed-password",
    };

    const mockUserInfo = {
        userId: 1,
        userName: "testuser",
        userBirthday: "19900101",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new FrontUserLoginUseCase(mockDb);
    });

    describe("execute", () => {

        it("正常系: ログインに成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getLoginUser = vi.fn().mockResolvedValue(mockLoginInfo);
            mockService.getUserInfo = vi.fn().mockResolvedValue(mockUserInfo);
            mockService.updateLastLoginDate = vi.fn().mockResolvedValue(undefined);

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("ログイン成功");
            if (result.success) {
                expect(result.data.response).toBeDefined();
                expect(result.data.refreshToken).toBe("mock-refresh-token");
            }
        });

        it("異常系: ユーザーが存在しない場合は認証エラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getLoginUser = vi.fn().mockResolvedValue(null);

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("IDかパスワードが間違っています。");
        });

        it("異常系: パスワードが一致しない場合は認証エラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getLoginUser = vi.fn().mockResolvedValue({
                ...mockLoginInfo,
                password: "different-password",
            });

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("IDかパスワードが間違っています。");
        });

        it("異常系: ユーザー情報が取得できない場合は認証エラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getLoginUser = vi.fn().mockResolvedValue(mockLoginInfo);
            mockService.getUserInfo = vi.fn().mockResolvedValue(null);

            // Act
            const result = await useCase.execute(validRequestBody);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("IDかパスワードが間違っています。");
        });
    });
});
