import type { FrontUserId } from "../../../domain";
import type { FrontUserMaster } from "../../../infrastructure/db";

/**
 * リフレッシュリポジトリインターフェース
 */
export interface IAuthRepository {
    /**
     * ユーザーIDでユーザー情報を取得
     * @param userId ユーザーID
     */
    findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined>;
}
