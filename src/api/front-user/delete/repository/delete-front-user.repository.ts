import { and, eq } from "drizzle-orm";
import { FLG } from "../../../../constant";
import type { FrontUserId } from "../../../../domain";
import type { Database } from "../../../../infrastructure/db";
import { frontUserLoginMaster, frontUserMaster } from "../../../../infrastructure/db";
import type { IDeleteFrontUserRepository } from "./delete-front-user.repository.interface";

/**
 * ユーザー削除リポジトリ実装
 */
export class DeleteFrontUserRepository implements IDeleteFrontUserRepository {
  constructor(private readonly db: Database) { }

  /**
   * ユーザー情報を論理削除
   */
  async deleteFrontUser(userId: FrontUserId): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(frontUserMaster)
      .set({
        deleteFlg: FLG.ON,
        updatedAt: now,
      })
      .where(
        and(
          eq(frontUserMaster.userId, userId.value),
          eq(frontUserMaster.deleteFlg, FLG.OFF)
        )
      )
      .returning();
    return result.length > 0;
  }

  /**
   * ログイン情報を論理削除
   */
  async deleteFrontLoginUser(userId: FrontUserId): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(frontUserLoginMaster)
      .set({
        deleteFlg: FLG.ON,
        updatedAt: now,
      })
      .where(
        and(
          eq(frontUserLoginMaster.userId, userId.value),
          eq(frontUserLoginMaster.deleteFlg, FLG.OFF)
        )
      );
  }
}
