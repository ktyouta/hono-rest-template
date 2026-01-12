import type { FrontUserId } from "../../../../domain";

/**
 * ユーザー削除リポジトリインターフェース
 */
export interface IDeleteFrontUserRepository {
  /**
   * ユーザー情報を論理削除
   * @param userId ユーザーID
   */
  deleteFrontUser(userId: FrontUserId): Promise<boolean>;

  /**
   * ログイン情報を論理削除
   * @param userId ユーザーID
   */
  deleteFrontLoginUser(userId: FrontUserId): Promise<void>;
}
