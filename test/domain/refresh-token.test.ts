import { describe, it, expect, vi } from "vitest";
import { FrontUserId } from "../../src/domain";

// envConfigをモック
vi.mock("../../src/config", () => ({
    envConfig: {
        accessTokenJwtKey: "test-jwt-secret-key-for-access-token",
        accessTokenExpires: "15m",
        refreshTokenJwtKey: "test-jwt-secret-key-for-refresh-token",
        refreshTokenExpires: "7d",
        isProduction: false,
    },
}));

// モック後にインポート
const { RefreshToken } = await import("../../src/domain/refresh-token/refresh-token");

describe("RefreshToken", () => {

  it("リフレッシュトークンを生成できること", async () => {
    const userId = FrontUserId.of(1);
    const refreshToken = await RefreshToken.create(userId);

    expect(refreshToken.value).toBeDefined();
    expect(typeof refreshToken.value).toBe("string");
  });

  it("JWT形式（3つのドット区切り）で生成されること", async () => {
    const userId = FrontUserId.of(1);
    const refreshToken = await RefreshToken.create(userId);

    expect(refreshToken.value.split(".")).toHaveLength(3);
  });

  describe("get", () => {
    it("Cookieからトークンを取得できること", async () => {
      const userId = FrontUserId.of(1);
      const createdToken = await RefreshToken.create(userId);

      const extractedToken = RefreshToken.get(createdToken.value);
      expect(extractedToken.value).toBe(createdToken.value);
    });

    it("Cookie未設定の場合にエラーになること", () => {
      expect(() => RefreshToken.get(undefined)).toThrow(
        "トークンが存在しません。"
      );
    });

    it("空文字の場合にエラーになること", () => {
      expect(() => RefreshToken.get("")).toThrow(
        "トークンが存在しません。"
      );
    });
  });

  describe("getPayload", () => {
    it("ユーザーIDを取得できること", async () => {
      const userId = FrontUserId.of(99);
      const refreshToken = await RefreshToken.create(userId);

      const extractedUserId = await refreshToken.getPayload();
      expect(extractedUserId.value).toBe(99);
    });
  });

  describe("isAbsoluteExpired", () => {
    it("期限内の場合にfalseを返すこと", async () => {
      const userId = FrontUserId.of(1);
      const refreshToken = await RefreshToken.create(userId);

      const isExpired = await refreshToken.isAbsoluteExpired();
      expect(isExpired).toBe(false);
    });
  });

  describe("refresh", () => {
    it("新しいトークンを生成できること", async () => {
      const userId = FrontUserId.of(1);
      const originalToken = await RefreshToken.create(userId);

      const newToken = await originalToken.refresh();

      expect(newToken.value).toBeDefined();
      expect(newToken.value.split(".")).toHaveLength(3);
    });

    it("refresh後もユーザーIDが保持されること", async () => {
      const userId = FrontUserId.of(123);
      const originalToken = await RefreshToken.create(userId);

      const newToken = await originalToken.refresh();
      const extractedUserId = await newToken.getPayload();

      expect(extractedUserId.value).toBe(123);
    });
  });

  describe("COOKIE_KEY", () => {
    it("Cookie名が正しいこと", () => {
      expect(RefreshToken.COOKIE_KEY).toBe("refresh_token");
    });
  });

  describe("COOKIE_SET_OPTION", () => {
    it("Cookieオプションを取得できること", () => {
      const options = RefreshToken.COOKIE_SET_OPTION;

      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe("/");
      expect(typeof options.maxAge).toBe("number");
    });
  });

  describe("COOKIE_CLEAR_OPTION", () => {
    it("クリアオプションを取得できること", () => {
      const options = RefreshToken.COOKIE_CLEAR_OPTION;

      expect(options.httpOnly).toBe(true);
      expect(options.maxAge).toBe(0);
      expect(options.path).toBe("/");
    });
  });
});
