import { describe, it, expect, vi, beforeAll } from "vitest";
import { FrontUserId } from "../../src/domain";
import { Header } from "../../src/domain/header/header";

// envConfigをモック
vi.mock("../../src/config", () => ({
    envConfig: {
        accessTokenJwtKey: "test-jwt-secret-key-for-access-token",
        accessTokenExpires: "15m",
        refreshTokenJwtKey: "test-jwt-secret-key-for-refresh-token",
        refreshTokenExpires: "7d",
    },
}));

// モック後にインポート
const { AccessToken } = await import("../../src/domain/access-token/access-token");

/**
 * テスト用のモックRequestを作成
 */
function createMockRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/test", {
    headers: new Headers(headers),
  });
}

describe("AccessToken", () => {

  it("アクセストークンを生成できること", async () => {
    const userId = FrontUserId.of(1);
    const accessToken = await AccessToken.create(userId);

    expect(accessToken.token).toBeDefined();
    expect(typeof accessToken.token).toBe("string");
  });

  it("JWT形式（3つのドット区切り）で生成されること", async () => {
    const userId = FrontUserId.of(1);
    const accessToken = await AccessToken.create(userId);

    expect(accessToken.token.split(".")).toHaveLength(3);
  });

  it("異なるユーザーIDで異なるトークンが生成されること", async () => {
    const userId1 = FrontUserId.of(1);
    const userId2 = FrontUserId.of(2);
    const token1 = await AccessToken.create(userId1);
    const token2 = await AccessToken.create(userId2);

    expect(token1.token).not.toBe(token2.token);
  });

  describe("get", () => {
    it("正常なヘッダからトークンを取得できること", async () => {
      const userId = FrontUserId.of(1);
      const createdToken = await AccessToken.create(userId);

      const request = createMockRequest({
        Authorization: `Bearer ${createdToken.token}`,
      });
      const header = new Header(request);
      const extractedToken = AccessToken.get(header);

      expect(extractedToken.token).toBe(createdToken.token);
    });

    it("Authorizationヘッダ未設定の場合にエラーになること", () => {
      const request = createMockRequest({});
      const header = new Header(request);

      expect(() => AccessToken.get(header)).toThrow(
        "Authorizationヘッダの形式が不正です。"
      );
    });

    it("不正な形式の場合にエラーになること", () => {
      const request = createMockRequest({
        Authorization: "InvalidFormat",
      });
      const header = new Header(request);

      expect(() => AccessToken.get(header)).toThrow(
        "Authorizationヘッダの形式が不正です。"
      );
    });

    it("Bearer以外のスキームの場合にエラーになること", () => {
      const request = createMockRequest({
        Authorization: "Basic abc123",
      });
      const header = new Header(request);

      expect(() => AccessToken.get(header)).toThrow(
        "Authorizationヘッダの形式が不正です。"
      );
    });

    it("Bearerとトークンの間にスペースがない場合にエラーになること", () => {
      const request = createMockRequest({
        Authorization: "Bearertoken123",
      });
      const header = new Header(request);

      expect(() => AccessToken.get(header)).toThrow(
        "Authorizationヘッダの形式が不正です。"
      );
    });
  });

  describe("getPayload", () => {
    it("ユーザーIDを取得できること", async () => {
      const userId = FrontUserId.of(42);
      const accessToken = await AccessToken.create(userId);

      const extractedUserId = await accessToken.getPayload();
      expect(extractedUserId.value).toBe(42);
    });

    it("不正なキーの場合にエラーになること", async () => {
      // 不正なJWTトークンを直接作成してテスト
      // 実装では内部でenvConfigのキーを使用するため、
      // 不正なトークン文字列でテスト
      const invalidToken = AccessToken.get(
        new Header(createMockRequest({ Authorization: "Bearer invalid.token.here" }))
      );

      await expect(invalidToken.getPayload()).rejects.toThrow();
    });
  });
});
