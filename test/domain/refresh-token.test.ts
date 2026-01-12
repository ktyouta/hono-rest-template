import { describe, it, expect } from "vitest";
import { RefreshToken, FrontUserId } from "../../src/domain";

describe("RefreshToken", () => {
  const TEST_JWT_KEY = "test-jwt-secret-key-for-refresh-token";
  const TEST_EXPIRES = 604800; // 7 days

  it("リフレッシュトークンを生成できること", async () => {
    const userId = FrontUserId.of(1);
    const refreshToken = await RefreshToken.create(
      userId,
      TEST_JWT_KEY,
      TEST_EXPIRES
    );

    expect(refreshToken.value).toBeDefined();
    expect(typeof refreshToken.value).toBe("string");
  });

  it("JWT形式（3つのドット区切り）で生成されること", async () => {
    const userId = FrontUserId.of(1);
    const refreshToken = await RefreshToken.create(
      userId,
      TEST_JWT_KEY,
      TEST_EXPIRES
    );

    expect(refreshToken.value.split(".")).toHaveLength(3);
  });

  describe("fromCookie", () => {
    it("Cookieからトークンを取得できること", async () => {
      const userId = FrontUserId.of(1);
      const createdToken = await RefreshToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const extractedToken = RefreshToken.fromCookie(createdToken.value);
      expect(extractedToken.value).toBe(createdToken.value);
    });

    it("Cookie未設定の場合にエラーになること", () => {
      expect(() => RefreshToken.fromCookie(undefined)).toThrow(
        "リフレッシュトークンが設定されていません。"
      );
    });

    it("空文字の場合にエラーになること", () => {
      expect(() => RefreshToken.fromCookie("")).toThrow(
        "リフレッシュトークンが設定されていません。"
      );
    });
  });

  describe("getPayload", () => {
    it("ユーザーIDを取得できること", async () => {
      const userId = FrontUserId.of(99);
      const refreshToken = await RefreshToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const extractedUserId = await refreshToken.getPayload(TEST_JWT_KEY);
      expect(extractedUserId.value).toBe(99);
    });
  });

  describe("isAbsoluteExpired", () => {
    it("期限内の場合にfalseを返すこと", async () => {
      const userId = FrontUserId.of(1);
      const refreshToken = await RefreshToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const isExpired = await refreshToken.isAbsoluteExpired(
        TEST_JWT_KEY,
        TEST_EXPIRES
      );
      expect(isExpired).toBe(false);
    });
  });

  describe("refresh", () => {
    it("新しいトークンを生成できること", async () => {
      const userId = FrontUserId.of(1);
      const originalToken = await RefreshToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const newToken = await originalToken.refresh(TEST_JWT_KEY, TEST_EXPIRES);

      expect(newToken.value).toBeDefined();
      expect(newToken.value.split(".")).toHaveLength(3);
    });

    it("refresh後もユーザーIDが保持されること", async () => {
      const userId = FrontUserId.of(123);
      const originalToken = await RefreshToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const newToken = await originalToken.refresh(TEST_JWT_KEY, TEST_EXPIRES);
      const extractedUserId = await newToken.getPayload(TEST_JWT_KEY);

      expect(extractedUserId.value).toBe(123);
    });
  });

  describe("COOKIE_KEY", () => {
    it("Cookie名が正しいこと", () => {
      expect(RefreshToken.COOKIE_KEY).toBe("refresh_token");
    });
  });

  describe("getCookieOptions", () => {
    it("本番環境用オプションを取得できること", () => {
      const options = RefreshToken.getCookieOptions(true, 3600);

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe("None");
      expect(options.maxAge).toBe(3600);
      expect(options.path).toBe("/");
    });

    it("開発環境用オプションを取得できること", () => {
      const options = RefreshToken.getCookieOptions(false, 7200);

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe("Lax");
      expect(options.maxAge).toBe(7200);
      expect(options.path).toBe("/");
    });
  });

  describe("getClearCookieOptions", () => {
    it("クリアオプションを取得できること", () => {
      const options = RefreshToken.getClearCookieOptions(true);

      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe("None");
      expect(options.maxAge).toBe(0);
      expect(options.path).toBe("/");
    });
  });
});
