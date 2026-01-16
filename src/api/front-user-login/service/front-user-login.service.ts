import type {
  FrontUserLoginMaster,
  FrontUserMaster,
} from "../../../infrastructure/db";
import type { FrontUserName, FrontUserId } from "../../../domain";
import type { IFrontUserLoginRepository } from "../repository";

/**
 * ログインサービス
 */
export class FrontUserLoginService {
  constructor(private readonly repository: IFrontUserLoginRepository) {}

  /**
   * ログイン情報を取得
   */
  async getLoginUser(
    userName: FrontUserName
  ): Promise<FrontUserLoginMaster | undefined> {
    return await this.repository.getLoginUser(userName);
  }

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    return await this.repository.getUserInfo(userId);
  }

  /**
   * 最終ログイン日時を更新
   */
  async updateLastLoginDate(userId: FrontUserId): Promise<void> {
    await this.repository.updateLastLoginDate(userId);
  }
}
