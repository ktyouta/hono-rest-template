import type { Database } from "../../../../infrastructure/db";
import { FrontUserId } from "../../../../domain";
import { DeleteFrontUserRepository } from "../repository";

/**
 * ユーザー削除サービス
 */
export class DeleteFrontUserService {
  private readonly repository: DeleteFrontUserRepository;

  constructor(db: Database) {
    this.repository = new DeleteFrontUserRepository(db);
  }

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
