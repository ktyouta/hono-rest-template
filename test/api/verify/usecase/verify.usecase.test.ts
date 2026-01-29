import { beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyUseCase } from "../../../../src/api/verify/usecase/verify.usecase";
import { HTTP_STATUS } from "../../../../src/constant";
import { FrontUserId, RefreshToken } from "../../../../src/domain";
import type { Database } from "../../../../src/infrastructure/db";


// vi.hoisted()を使用してモック用の変数をホイスト
const mockRefreshTokenInstance = vi.hoisted(() => ({
    getPayload: vi.fn(),
    isAbsoluteExpired: vi.fn(),
}));

// モック
vi.mock("../../../../src/api/verify/repository/verify.repository", () => ({
    VerifyRepository: vi.fn(),
}));

vi.mock("../../../../src/api/verify/service/verify.service", () => ({
    VerifyService: vi.fn().mockImplementation(() => ({
        getUser: vi.fn(),
    })),
}));

vi.mock("../../../../src/config", () => ({
    envConfig: {
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


describe("VerifyUseCase", () => {

    let mockDb: Database;
    let useCase: VerifyUseCase;

    const mockUserInfo = {
        userId: 1,
        userName: "testuser",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new VerifyUseCase(mockDb);

        // リセット
        mockRefreshTokenInstance.getPayload.mockResolvedValue(FrontUserId.of(1));
        mockRefreshTokenInstance.isAbsoluteExpired.mockResolvedValue(false);
    });

    describe("execute", () => {

        it("正常系: 認証チェックに成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getUser = vi.fn().mockResolvedValue(mockUserInfo);
            const refreshToken = RefreshToken.get("valid-refresh-token");

            // Act
            const result = await useCase.execute(refreshToken);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.OK);
            expect(result.message).toBe("認証成功");
            if (result.success) {
                expect(result.data.accessToken).toBe("mock-access-token");
            }
        });

        it("異常系: ユーザーが見つからない場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.getUser = vi.fn().mockResolvedValue(null);
            const refreshToken = RefreshToken.get("valid-refresh-token");

            // Act
            const result = await useCase.execute(refreshToken);

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
            const refreshToken = RefreshToken.get("valid-refresh-token");

            // Act
            const result = await useCase.execute(refreshToken);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(result.message).toBe("リフレッシュトークンの絶対期限切れ");
        });
    });
});
