import { eq, and } from "drizzle-orm";
import type { Database, FrontUserMaster } from "../../../../infrastructure/db";
import { frontUserMaster, frontUserLoginMaster } from "../../../../infrastructure/db";
import { FLG } from "../../../../const";
import { FrontUserName } from "../../../../domain";
import { FrontUserEntity, FrontUserLoginEntity } from "../entity";

/**
 * ユーザー作成リポジトリ
 */
export class CreateFrontUserRepository {
  constructor(private readonly db: Database) {}

  /**
   * ユーザー名でユーザーを検索
   * @param userName ユーザー名
   */
  async findByUserName(userName: FrontUserName): Promise<FrontUserMaster[]> {
    return await this.db
      .select()
      .from(frontUserMaster)
      .where(
        and(
          eq(frontUserMaster.userName, userName.value),
          eq(frontUserMaster.deleteFlg, FLG.OFF)
        )
      );
  }

  /**
   * ユーザー情報を挿入
   * @param entity ユーザーエンティティ
   */
  async insertFrontUser(entity: FrontUserEntity): Promise<FrontUserMaster> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(frontUserMaster)
      .values({
        userId: entity.frontUserId,
        userName: entity.frontUserName,
        userBirthday: entity.frontUserBirthday,
        deleteFlg: FLG.OFF,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  /**
   * ログイン情報を挿入
   * @param entity ログインエンティティ
   */
  async insertFrontLoginUser(entity: FrontUserLoginEntity): Promise<void> {
    const now = new Date().toISOString();
    await this.db.insert(frontUserLoginMaster).values({
      userId: entity.frontUserId,
      userName: entity.frontUserName,
      password: entity.frontUserPassword,
      salt: entity.salt,
      deleteFlg: FLG.OFF,
      createdAt: now,
      updatedAt: now,
    });
  }
}
