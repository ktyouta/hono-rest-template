import type { FrontUserMaster } from "../../../../infrastructure/db";
import type { FrontUserId, FrontUserName } from "../../../../domain";
import type { IUpdateFrontUserRepository } from "../repository";

/**
 * ユーザー更新サービス
 */
export class UpdateFrontUserService {
  constructor(private readonly repository: IUpdateFrontUserRepository) {}

  /**
   * ユーザー名の重複チェック（自身を除く）
   */
  async checkUserNameExists(
    userId: FrontUserId,
    userName: FrontUserName
  ): Promise<boolean> {
    return await this.repository.checkUserNameExists(userId, userName);
  }

  /**
   * ユーザー情報を更新
   */
  async updateFrontUser(
    userId: FrontUserId,
    userName: string,
    userBirthday: string
  ): Promise<FrontUserMaster | undefined> {
    return await this.repository.updateFrontUser(userId, userName, userBirthday);
  }

  /**
   * ログイン情報を更新
   */
  async updateFrontLoginUser(
    userId: FrontUserId,
    userName: string
  ): Promise<void> {
    await this.repository.updateFrontLoginUser(userId, userName);
  }
}
