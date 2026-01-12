import type { FrontUserMaster } from "../../../infrastructure/db";
import type { FrontUserId } from "../../../domain";

/**
 * リフレッシュリポジトリインターフェース
 */
export interface IRefreshRepository {
  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined>;
}
