import { describe, it, expect } from "vitest";
import { AccessToken, FrontUserId } from "../../src/domain";
import { Header } from "../../src/domain/header/header";

/**
 * テスト用のモックRequestを作成
 */
function createMockRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/test", {
    headers: new Headers(headers),
  });
}

describe("AccessToken", () => {
  const TEST_JWT_KEY = "test-jwt-secret-key-for-access-token";
  const TEST_EXPIRES = 900; // 15 minutes

  it("アクセストークンを生成できること", async () => {
    const userId = FrontUserId.of(1);
    const accessToken = await AccessToken.create(
      userId,
      TEST_JWT_KEY,
      TEST_EXPIRES
    );

    expect(accessToken.token).toBeDefined();
    expect(typeof accessToken.token).toBe("string");
  });

  it("JWT形式（3つのドット区切り）で生成されること", async () => {
    const userId = FrontUserId.of(1);
    const accessToken = await AccessToken.create(
      userId,
      TEST_JWT_KEY,
      TEST_EXPIRES
    );

    expect(accessToken.token.split(".")).toHaveLength(3);
  });

  it("異なるユーザーIDで異なるトークンが生成されること", async () => {
    const userId1 = FrontUserId.of(1);
    const userId2 = FrontUserId.of(2);
    const token1 = await AccessToken.create(userId1, TEST_JWT_KEY, TEST_EXPIRES);
    const token2 = await AccessToken.create(userId2, TEST_JWT_KEY, TEST_EXPIRES);

    expect(token1.token).not.toBe(token2.token);
  });

  describe("get", () => {
    it("正常なヘッダからトークンを取得できること", async () => {
      const userId = FrontUserId.of(1);
      const createdToken = await AccessToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

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
        "Authorizationヘッダが設定されていません。"
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
      const accessToken = await AccessToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      const extractedUserId = await accessToken.getPayload(TEST_JWT_KEY);
      expect(extractedUserId.value).toBe(42);
    });

    it("不正なキーの場合にエラーになること", async () => {
      const userId = FrontUserId.of(1);
      const accessToken = await AccessToken.create(
        userId,
        TEST_JWT_KEY,
        TEST_EXPIRES
      );

      await expect(accessToken.getPayload("wrong-key")).rejects.toThrow();
    });
  });
});
