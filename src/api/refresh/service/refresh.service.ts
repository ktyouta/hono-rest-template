import type { FrontUserMaster } from "../../../infrastructure/db";
import type { FrontUserId } from "../../../domain";
import type { IRefreshRepository } from "../repository";

/**
 * リフレッシュサービス
 */
export class RefreshService {
  constructor(private readonly repository: IRefreshRepository) {}

  /**
   * ユーザー情報を取得
   */
  async getUser(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
