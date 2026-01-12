import type { Database, FrontUserMaster } from "../../../infrastructure/db";
import { FrontUserId } from "../../../domain";
import { RefreshRepository } from "../repository";

/**
 * リフレッシュサービス
 */
export class RefreshService {
  private readonly repository: RefreshRepository;

  constructor(db: Database) {
    this.repository = new RefreshRepository(db);
  }

  /**
   * ユーザー情報を取得
   */
  async getUser(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
