/**
 * フロントユーザーソルト
 */
export class FrontUserSalt {
  private readonly _value: string;

  private constructor(salt: string) {
    this._value = salt;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ランダムなソルトを生成（16バイト = 32文字の16進数）
   */
  static generate(): FrontUserSalt {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const salt = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return new FrontUserSalt(salt);
  }

  /**
   * 既存のソルト値からインスタンスを生成
   */
  static of(salt: string): FrontUserSalt {
    return new FrontUserSalt(salt);
  }
}
