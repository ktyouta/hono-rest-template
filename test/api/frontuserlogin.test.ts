import { describe, it, expect } from "vitest";
import { FrontUserLoginSchema } from "../../src/api/frontuserlogin/schema";
import { FrontUserLoginResponseDto } from "../../src/api/frontuserlogin/dto";
import type { FrontUserMaster } from "../../src/infrastructure/db";

describe("FrontUserLogin Schema Validation", () => {
  describe("FrontUserLoginSchema", () => {
    it("正常なデータでバリデーションを通過すること", () => {
      const result = FrontUserLoginSchema.safeParse({
        userName: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が空の場合にエラーになること", () => {
      const result = FrontUserLoginSchema.safeParse({
        userName: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ユーザー名を入力してください"
        );
      }
    });

    it("パスワードが空の場合にエラーになること", () => {
      const result = FrontUserLoginSchema.safeParse({
        userName: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "パスワードを入力してください"
        );
      }
    });

    it("ユーザー名とパスワードが両方空の場合に複数エラーになること", () => {
      const result = FrontUserLoginSchema.safeParse({
        userName: "",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });
});

describe("FrontUserLoginResponseDto", () => {
  it("ユーザー情報からDTOを生成できること", () => {
    const userInfo: FrontUserMaster = {
      userId: 1,
      userName: "testuser",
      userBirthday: "19900101",
      lastLoginDate: "2024-01-01T00:00:00.000Z",
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const accessToken = "test-access-token";

    const dto = new FrontUserLoginResponseDto(userInfo, accessToken);

    expect(dto.value.accessToken).toBe("test-access-token");
    expect(dto.value.user.userId).toBe(1);
    expect(dto.value.user.userName).toBe("testuser");
    expect(dto.value.user.birthday).toBe("19900101");
  });

  it("lastLoginDateがnullでもDTOを生成できること", () => {
    const userInfo: FrontUserMaster = {
      userId: 2,
      userName: "newuser",
      userBirthday: "19950515",
      lastLoginDate: null,
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const accessToken = "another-access-token";

    const dto = new FrontUserLoginResponseDto(userInfo, accessToken);

    expect(dto.value.accessToken).toBe("another-access-token");
    expect(dto.value.user.userId).toBe(2);
    expect(dto.value.user.userName).toBe("newuser");
    expect(dto.value.user.birthday).toBe("19950515");
  });
});
