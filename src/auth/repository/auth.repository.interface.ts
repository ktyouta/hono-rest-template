import type { FrontUserMaster } from "../../infrastructure/db";
import type { FrontUserId } from "../../domain";

/**
 * 認証リポジトリインターフェース
 */
export interface IAuthRepository {
  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined>;
}
