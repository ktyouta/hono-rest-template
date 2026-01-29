import { and, eq, ne } from "drizzle-orm";
import { FLG } from "../../../../constant";
import type { FrontUserId, FrontUserName } from "../../../../domain";
import type { Database, FrontUserMaster } from "../../../../infrastructure/db";
import { frontUserLoginMaster, frontUserMaster } from "../../../../infrastructure/db";
import type { IUpdateFrontUserRepository } from "./update-front-user.repository.interface";

/**
 * ユーザー更新リポジトリ実装
 */
export class UpdateFrontUserRepository implements IUpdateFrontUserRepository {
  constructor(private readonly db: Database) { }

  /**
   * 他のユーザーで同じユーザー名が存在するかチェック
   * @param userId 自身のユーザーID
   * @param userName ユーザー名
   */
  async checkUserNameExists(
    userId: FrontUserId,
    userName: FrontUserName
  ): Promise<boolean> {
    const result = await this.db
      .select()
      .from(frontUserMaster)
      .where(
        and(
          eq(frontUserMaster.userName, userName.value),
          ne(frontUserMaster.userId, userId.value),
          eq(frontUserMaster.deleteFlg, FLG.OFF)
        )
      );
    return result.length > 0;
  }

  /**
   * ユーザー情報を更新
   */
  async updateFrontUser(
    userId: FrontUserId,
    userName: string,
    userBirthday: string
  ): Promise<FrontUserMaster | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(frontUserMaster)
      .set({
        userName,
        userBirthday,
        updatedAt: now,
      })
      .where(
        and(
          eq(frontUserMaster.userId, userId.value),
          eq(frontUserMaster.deleteFlg, FLG.OFF)
        )
      )
      .returning();
    return result[0];
  }

  /**
   * ログイン情報のユーザー名を更新
   */
  async updateFrontLoginUser(
    userId: FrontUserId,
    userName: string
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(frontUserLoginMaster)
      .set({
        userName,
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
