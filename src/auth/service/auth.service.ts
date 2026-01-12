import type { FrontUserMaster } from "../../infrastructure/db";
import { FrontUserId } from "../../domain";
import { AuthRepository } from "../repository";

/**
 * 認証サービス
 */
export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async getUserById(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
