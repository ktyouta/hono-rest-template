import type {
  FrontUserLoginMaster,
  FrontUserMaster,
} from "../../../infrastructure/db";
import type { FrontUserName, FrontUserId } from "../../../domain";

/**
 * ログインリポジトリインターフェース
 */
export interface IFrontUserLoginRepository {
  /**
   * ユーザー名でログイン情報を取得
   * @param userName ユーザー名
   */
  getLoginUser(userName: FrontUserName): Promise<FrontUserLoginMaster | undefined>;

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  getUserInfo(userId: FrontUserId): Promise<FrontUserMaster | undefined>;

  /**
   * 最終ログイン日時を更新
   * @param userId ユーザーID
   */
  updateLastLoginDate(userId: FrontUserId): Promise<void>;
}
