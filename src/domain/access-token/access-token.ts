import { sign, verify } from "hono/jwt";
import { FrontUserId } from "../front-user-id";
import { Header } from "../header/header";
import { AccessTokenError } from "./access-token.error";

/**
 * アクセストークン
 */
export class AccessToken {
  private static readonly HEADER_KEY = "Authorization";
  private static readonly SCHEME = "Bearer";

  private readonly _token: string;

  private constructor(token: string) {
    this._token = token;
  }

  get token(): string {
    return this._token;
  }

  /**
   * アクセストークンを生成
   * @param frontUserId ユーザーID
   * @param jwtKey JWT署名キー
   * @param expires 有効期限（秒）
   */
  static async create(
    frontUserId: FrontUserId,
    jwtKey: string,
    expires: number
  ): Promise<AccessToken> {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: String(frontUserId.value),
      iat: now,
      exp: now + expires,
    };
    const token = await sign(payload, jwtKey);
    return new AccessToken(token);
  }

  /**
   * Authorizationヘッダからアクセストークンを取得
   * @param authHeader Authorizationヘッダの値
   */
  static get(header: Header): AccessToken {

    const authHeader = header.get(AccessToken.HEADER_KEY) || ``;

    if (!authHeader) {
      throw new AccessTokenError("Authorizationヘッダが設定されていません。");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== AccessToken.SCHEME) {
      throw new AccessTokenError("Authorizationヘッダの形式が不正です。");
    }

    return new AccessToken(parts[1]);
  }

  /**
   * トークンを検証してペイロードを取得
   * @param jwtKey JWT署名キー
   */
  async getPayload(jwtKey: string): Promise<FrontUserId> {
    const decoded = await verify(this._token, jwtKey);
    const userId = Number(decoded.sub);
    if (!userId) {
      throw new AccessTokenError("トークンのペイロードが不正です。");
    }
    return FrontUserId.of(userId);
  }
}
