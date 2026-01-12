/**
 * フロントユーザーID
 */
export class FrontUserId {
  private readonly _value: number;

  private constructor(userId: number) {
    if (!userId) {
      throw new Error("ユーザーIDが設定されていません。");
    }
    this._value = userId;
  }

  get value(): number {
    return this._value;
  }

  /**
   * ファクトリメソッド
   */
  static of(userId: number): FrontUserId {
    return new FrontUserId(userId);
  }
}
