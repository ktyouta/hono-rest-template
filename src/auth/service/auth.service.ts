import type { FrontUserMaster } from "../../infrastructure/db";
import type { FrontUserId } from "../../domain";
import type { IAuthRepository } from "../repository";

/**
 * 認証サービス
 */
export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async getUserById(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
