import { FrontUserSalt } from "../front-user-salt";
import { Pepper } from "../pepper";

/**
 * フロントユーザーパスワード
 * HMAC-SHA256 + PBKDF2でハッシュ化
 */
export class FrontUserPassword {
  private readonly _value: string;
  private static readonly HASH_LENGTH = 64;
  private static readonly ITERATIONS = 100000;

  private constructor(hashedPassword: string) {
    this._value = hashedPassword;
  }

  get value(): string {
    return this._value;
  }

  /**
   * パスワードをハッシュ化
   * @param inputPassword 入力パスワード
   * @param salt ソルト
   * @param pepper ペッパー
   */
  static async hash(
    inputPassword: string,
    salt: FrontUserSalt,
    pepper: Pepper
  ): Promise<FrontUserPassword> {
    // HMAC-SHA256でペッパーを適用
    const encoder = new TextEncoder();
    const pepperKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(pepper.value),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const keyedPassword = await crypto.subtle.sign(
      "HMAC",
      pepperKey,
      encoder.encode(inputPassword)
    );

    // PBKDF2でハッシュ化
    const baseKey = await crypto.subtle.importKey(
      "raw",
      keyedPassword,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt.value),
        iterations: FrontUserPassword.ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      FrontUserPassword.HASH_LENGTH * 8
    );

    // 16進数文字列に変換
    const hashedPassword = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return new FrontUserPassword(hashedPassword);
  }

  /**
   * 既存のハッシュ値からインスタンスを生成
   */
  static of(hashedPassword: string): FrontUserPassword {
    return new FrontUserPassword(hashedPassword);
  }

  /**
   * パスワード比較
   */
  equals(other: FrontUserPassword): boolean {
    return this._value === other.value;
  }
}
