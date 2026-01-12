import { sign, verify, decode } from "hono/jwt";
import { FrontUserId } from "../front-user-id";

type RefreshTokenPayload = {
  sub: string;
  iat: number;
  exp: number;
  sessionStartedAt: number;
};

/**
 * リフレッシュトークン
 */
export class RefreshToken {
  static readonly COOKIE_KEY = "refresh_token";

  private readonly _value: string;

  private constructor(token: string) {
    this._value = token;
  }

  get value(): string {
    return this._value;
  }

  /**
   * リフレッシュトークンを生成
   * @param frontUserId ユーザーID
   * @param jwtKey JWT署名キー
   * @param expires 有効期限（秒）
   */
  static async create(
    frontUserId: FrontUserId,
    jwtKey: string,
    expires: number
  ): Promise<RefreshToken> {
    const now = Math.floor(Date.now() / 1000);
    const payload: RefreshTokenPayload = {
      sub: String(frontUserId.value),
      iat: now,
      exp: now + expires,
      sessionStartedAt: now,
    };
    const token = await sign(payload, jwtKey);
    return new RefreshToken(token);
  }

  /**
   * Cookieからリフレッシュトークンを取得
   * @param cookieValue Cookieの値
   */
  static fromCookie(cookieValue: string | undefined): RefreshToken {
    if (!cookieValue) {
      throw new Error("リフレッシュトークンが設定されていません。");
    }
    return new RefreshToken(cookieValue);
  }

  /**
   * トークンを検証してペイロードを取得
   * @param jwtKey JWT署名キー
   */
  async getPayload(jwtKey: string): Promise<FrontUserId> {
    const decoded = await verify(this._value, jwtKey);
    const userId = Number(decoded.sub);
    if (!userId) {
      throw new Error("トークンのペイロードが不正です。");
    }
    return FrontUserId.of(userId);
  }

  /**
   * 絶対期限をチェック（iat からの経過時間）
   * @param jwtKey JWT署名キー
   * @param expiresSeconds 有効期限（秒）
   */
  async isAbsoluteExpired(jwtKey: string, expiresSeconds: number): Promise<boolean> {
    const decoded = await verify(this._value, jwtKey);
    const nowMs = Date.now();
    const iatMs = (decoded.iat as number) * 1000;
    return nowMs - iatMs > expiresSeconds * 1000;
  }

  /**
   * トークンをリフレッシュ（iatは保持、sessionStartedAtを更新）
   * @param jwtKey JWT署名キー
   * @param expires 有効期限（秒）
   */
  async refresh(jwtKey: string, expires: number): Promise<RefreshToken> {
    const decoded = (await verify(this._value, jwtKey)) as RefreshTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    const payload: RefreshTokenPayload = {
      sub: decoded.sub,
      iat: decoded.iat, // 元のiatを保持
      exp: now + expires,
      sessionStartedAt: now,
    };

    const token = await sign(payload, jwtKey);
    return new RefreshToken(token);
  }

  /**
   * Cookie設定オプションを取得
   */
  static getCookieOptions(isProduction: boolean, maxAgeSeconds: number) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("None" as const) : ("Lax" as const),
      maxAge: maxAgeSeconds,
      path: "/",
    };
  }

  /**
   * Cookieクリアオプションを取得
   */
  static getClearCookieOptions(isProduction: boolean) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("None" as const) : ("Lax" as const),
      path: "/",
      maxAge: 0,
    };
  }
}
