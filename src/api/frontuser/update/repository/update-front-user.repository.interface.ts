import type { FrontUserMaster } from "../../../../infrastructure/db";
import type { FrontUserId, FrontUserName } from "../../../../domain";

/**
 * ユーザー更新リポジトリインターフェース
 */
export interface IUpdateFrontUserRepository {
  /**
   * 他のユーザーで同じユーザー名が存在するかチェック
   * @param userId 自身のユーザーID
   * @param userName ユーザー名
   */
  checkUserNameExists(userId: FrontUserId, userName: FrontUserName): Promise<boolean>;

  /**
   * ユーザー情報を更新
   * @param userId ユーザーID
   * @param userName ユーザー名
   * @param userBirthday 生年月日
   */
  updateFrontUser(
    userId: FrontUserId,
    userName: string,
    userBirthday: string
  ): Promise<FrontUserMaster | undefined>;

  /**
   * ログイン情報のユーザー名を更新
   * @param userId ユーザーID
   * @param userName ユーザー名
   */
  updateFrontLoginUser(userId: FrontUserId, userName: string): Promise<void>;
}
