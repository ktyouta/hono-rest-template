import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteFrontUserUseCase } from "../../../../../src/api/front-user/delete/usecase/delete-front-user.usecase";
import { HTTP_STATUS } from "../../../../../src/const";
import { FrontUserId } from "../../../../../src/domain";
import type { Database } from "../../../../../src/infrastructure/db";


// モック
vi.mock("../../../../../src/api/front-user/delete/repository", () => ({
    DeleteFrontUserRepository: vi.fn(),
}));

vi.mock("../../../../../src/api/front-user/delete/service", () => ({
    DeleteFrontUserService: vi.fn().mockImplementation(() => ({
        deleteFrontLoginUser: vi.fn(),
        deleteFrontUser: vi.fn(),
    })),
}));


describe("DeleteFrontUserUseCase", () => {

    let mockDb: Database;
    let useCase: DeleteFrontUserUseCase;

    const validUserId = FrontUserId.of(1);

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = {} as Database;
        useCase = new DeleteFrontUserUseCase(mockDb);
    });

    describe("execute", () => {

        it("正常系: ユーザー削除に成功する", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.deleteFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockService.deleteFrontUser = vi.fn().mockResolvedValue(true);

            // Act
            const result = await useCase.execute(validUserId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.status).toBe(HTTP_STATUS.NO_CONTENT);
            expect(result.message).toBe("ユーザーの削除が完了しました。");
        });

        it("異常系: ユーザーが見つからない場合はエラーを返す", async () => {
            // Arrange
            const mockService = (useCase as any).service;
            mockService.deleteFrontLoginUser = vi.fn().mockResolvedValue(undefined);
            mockService.deleteFrontUser = vi.fn().mockResolvedValue(false);

            // Act
            const result = await useCase.execute(validUserId);

            // Assert
            expect(result.success).toBe(false);
            expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(result.message).toBe("ユーザーが見つかりません。");
        });
    });
});
