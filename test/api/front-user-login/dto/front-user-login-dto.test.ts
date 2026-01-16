import { describe, it, expect } from "vitest";
import { FrontUserLoginResponseDto } from "../../../../src/api/front-user-login/dto";
import type { FrontUserMaster } from "../../../../src/infrastructure/db";

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
