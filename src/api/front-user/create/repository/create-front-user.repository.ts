import { and, eq } from "drizzle-orm";
import { FLG } from "../../../../constant";
import type { FrontUserName } from "../../../../domain";
import type { Database, FrontUserMaster } from "../../../../infrastructure/db";
import { frontUserLoginMaster, frontUserMaster } from "../../../../infrastructure/db";
import type { FrontUserEntity, FrontUserLoginEntity } from "../entity";
import type { ICreateFrontUserRepository } from "./create-front-user.repository.interface";

/**
 * ユーザー作成リポジトリ実装
 */
export class CreateFrontUserRepository implements ICreateFrontUserRepository {
  constructor(private readonly db: Database) { }

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
