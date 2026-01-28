import type { FrontUserId } from "../../../domain";
import type {
    FrontUserMaster
} from "../../../infrastructure/db";
import { IAuthRepository } from "../repository/auth.repository.interface";

/**
 * ログインサービス
 */
export class AuthService {
    constructor(private readonly repository: IAuthRepository) { }

    /**
     * ユーザー情報を取得
     */
    async getUser(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
        return await this.repository.findByUserId(userId);
    }
}
