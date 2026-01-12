import type { FrontUserId } from "../../../../domain";
import type { IDeleteFrontUserRepository } from "../repository";

/**
 * ユーザー削除サービス
 */
export class DeleteFrontUserService {
  constructor(private readonly repository: IDeleteFrontUserRepository) {}

  /**
   * ユーザー情報を削除
   */
  async deleteFrontUser(userId: FrontUserId): Promise<boolean> {
    return await this.repository.deleteFrontUser(userId);
  }

  /**
   * ログイン情報を削除
   */
  async deleteFrontLoginUser(userId: FrontUserId): Promise<void> {
    await this.repository.deleteFrontLoginUser(userId);
  }
}
