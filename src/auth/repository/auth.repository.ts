import { and, eq } from "drizzle-orm";
import { FLG } from "../../constant";
import type { FrontUserId } from "../../domain";
import type { Database, FrontUserMaster } from "../../infrastructure/db";
import { frontUserMaster } from "../../infrastructure/db";
import type { IAuthRepository } from "./auth.repository.interface";

/**
 * 認証リポジトリ実装
 */
export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) { }

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
