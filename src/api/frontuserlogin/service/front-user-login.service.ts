import type {
  Database,
  FrontUserLoginMaster,
  FrontUserMaster,
} from "../../../infrastructure/db";
import { FrontUserName, FrontUserId } from "../../../domain";
import { FrontUserLoginRepository } from "../repository";

/**
 * ログインサービス
 */
export class FrontUserLoginService {
  private readonly repository: FrontUserLoginRepository;

  constructor(db: Database) {
    this.repository = new FrontUserLoginRepository(db);
  }

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
