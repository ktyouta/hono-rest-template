import type { FrontUserId } from "../../../domain";
import type {
    FrontUserMaster
} from "../../../infrastructure/db";
import { IVerifyRepository } from "../repository/verify.repository.interface";

/**
 * ログインサービス
 */
export class VerifyService {
    constructor(private readonly repository: IVerifyRepository) { }

    /**
     * ユーザー情報を取得
     */
    async getUser(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
        return await this.repository.findByUserId(userId);
    }
}
