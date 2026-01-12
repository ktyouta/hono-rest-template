import { eq, and } from "drizzle-orm";
import type { Database, FrontUserMaster } from "../../../infrastructure/db";
import { frontUserMaster } from "../../../infrastructure/db";
import { FLG } from "../../../const";
import { FrontUserId } from "../../../domain";

/**
 * リフレッシュリポジトリ
 */
export class RefreshRepository {
  constructor(private readonly db: Database) {}

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    const result = await this.db
      .select()
      .from(frontUserMaster)
      .where(
        and(
          eq(frontUserMaster.userId, userId.value),
          eq(frontUserMaster.deleteFlg, FLG.OFF)
        )
      );
    return result[0];
  }
}
