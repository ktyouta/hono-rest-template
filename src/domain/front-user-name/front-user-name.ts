/**
 * フロントユーザー名
 */
export class FrontUserName {
  private readonly _value: string;

  constructor(userName: string) {
    if (!userName) {
      throw new Error("ユーザー名が設定されていません。");
    }
    this._value = userName;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ユーザー名重複チェック
   */
  equals(other: FrontUserName): boolean {
    return this._value === other.value;
  }
}
