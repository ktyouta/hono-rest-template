import { eq } from "drizzle-orm";
import type { Database } from "../../infrastructure/db";
import { seqMaster } from "../../infrastructure/db";

/**
 * シーケンスキー
 */
export class SeqKey {
  private readonly _value: string;

  constructor(key: string) {
    if (!key) {
      throw new Error("シーケンスキーが設定されていません。");
    }
    this._value = key;
  }

  get value(): string {
    return this._value;
  }
}

/**
 * シーケンス発行
 */
export class SeqIssue {
  /**
   * 次のIDを取得
   * @param key シーケンスキー
   * @param db データベースクライアント
   */
  static async get(key: SeqKey, db: Database): Promise<number> {
    const now = new Date().toISOString();

    // 現在の値を取得
    const current = await db
      .select()
      .from(seqMaster)
      .where(eq(seqMaster.key, key.value));

    if (current.length === 0) {
      // 存在しない場合は新規作成
      await db.insert(seqMaster).values({
        key: key.value,
        nextId: 2,
        createdAt: now,
        updatedAt: now,
      });
      return 1;
    }

    const nextId = current[0].nextId;

    // 次のIDに更新
    await db
      .update(seqMaster)
      .set({
        nextId: nextId + 1,
        updatedAt: now,
      })
      .where(eq(seqMaster.key, key.value));

    return nextId;
  }
}
