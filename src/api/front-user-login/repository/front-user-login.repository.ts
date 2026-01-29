import { and, eq } from "drizzle-orm";
import { FLG } from "../../../constant";
import type { FrontUserId, FrontUserName } from "../../../domain";
import type {
  Database,
  FrontUserLoginMaster,
  FrontUserMaster,
} from "../../../infrastructure/db";
import { frontUserLoginMaster, frontUserMaster } from "../../../infrastructure/db";
import type { IFrontUserLoginRepository } from "./front-user-login.repository.interface";

/**
 * ログインリポジトリ実装
 */
export class FrontUserLoginRepository implements IFrontUserLoginRepository {
  constructor(private readonly db: Database) { }

  /**
   * ユーザー名でログイン情報を取得
   * @param userName ユーザー名
   */
  async getLoginUser(
    userName: FrontUserName
  ): Promise<FrontUserLoginMaster | undefined> {
    const result = await this.db
      .select()
      .from(frontUserLoginMaster)
      .where(
        and(
          eq(frontUserLoginMaster.userName, userName.value),
          eq(frontUserLoginMaster.deleteFlg, FLG.OFF)
        )
      );
    return result[0];
  }

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async getUserInfo(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
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

  /**
   * 最終ログイン日時を更新
   * @param userId ユーザーID
   */
  async updateLastLoginDate(userId: FrontUserId): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(frontUserMaster)
      .set({
        lastLoginDate: now,
        updatedAt: now,
      })
      .where(eq(frontUserMaster.userId, userId.value));
  }
}
