import { beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshUseCase } from "../../../../src/api/refresh/usecase/refresh.usecase";
import { HTTP_STATUS } from "../../../../src/const";
import { FrontUserId } from "../../../../src/domain";
import type { Database } from "../../../../src/infrastructure/db";


// vi.hoisted()を使用してモック用の変数をホイスト
const mockRefreshTokenInstance = vi.hoisted(() => ({
    getPayload: vi.fn(),
    isAbsoluteExpired: vi.fn(),
    refresh: vi.fn(),
}));

// モック
vi.mock("../../../../src/api/refresh/repository", () => ({
    RefreshRepository: vi.fn(),
}));

vi.mock("../../../../src/api/refresh/service", () => ({
    RefreshService: vi.fn().mockImplementation(() => ({
        getUser: vi.fn(),
    })),
}));

vi.mock("../../../../src/config", () => ({
    envConfig: {
        corsOrigin: ["http://localhost:3000"],
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
        get: vi.fn().mockReturnValue(mockRefreshTokenInstance),
    },
}));


describe("RefreshUseCase", () => {

    let mockDb: Database;
    let useCase: RefreshUseCase;

    const validRefreshToken = "valid-refresh-token";
    const validOrigin = "http://localhost:3000";
    const validCsrfToken = "web";

    const mockUserInfo = {
        userId: 1,
        userName: "testuser",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new RefreshUseCase(mockDb);

        // リセット
        mockRefreshTokenInstance.getPayload.mockResolvedValue(FrontUserId.of(1));
        mockRefreshTokenInstance.isAbsoluteExpired.mockResolvedValue(false);
        mockRefreshTokenInstance.refresh.mockResolvedValue({ value: "new-mock-refresh-token" });
    });

    describe("execute", () => {

        it("正常系: トークンリフレッシュに成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getUser = vi.fn().mockResolvedValue(mockUserInfo);

            // Act
            const result = await useCase.execute(validRefreshToken, validOrigin, validCsrfToken);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("認証成功");
            if (result.success) {
                expect(result.data.accessToken).toBe("mock-access-token");
                expect(result.data.refreshToken).toBe("new-mock-refresh-token");
            }
        });

        it("異常系: Originが不正な場合はエラーを返す", async () => {
            // Act
            const result = await useCase.execute(validRefreshToken, "http://invalid-origin.com", validCsrfToken);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("許可されていないOrigin");
        });

        it("異常系: Originがない場合はエラーを返す", async () => {
            // Act
            const result = await useCase.execute(validRefreshToken, undefined, validCsrfToken);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("許可されていないOrigin");
        });

        it("異常系: CSRFトークンが不正な場合はエラーを返す", async () => {
            // Act
            const result = await useCase.execute(validRefreshToken, validOrigin, "invalid-csrf");

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("カスタムヘッダが不正");
        });

        it("異常系: ユーザーが見つからない場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getUser = vi.fn().mockResolvedValue(null);

            // Act
            const result = await useCase.execute(validRefreshToken, validOrigin, validCsrfToken);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("ユーザーが見つかりません");
        });

        it("異常系: リフレッシュトークンの絶対期限切れの場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getUser = vi.fn().mockResolvedValue(mockUserInfo);
            mockRefreshTokenInstance.isAbsoluteExpired.mockResolvedValue(true);

            // Act
            const result = await useCase.execute(validRefreshToken, validOrigin, validCsrfToken);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("リフレッシュトークンの絶対期限切れ");
        });
    });
});
