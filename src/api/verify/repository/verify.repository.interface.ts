import type { FrontUserId } from "../../../domain";
import type { FrontUserMaster } from "../../../infrastructure/db";

/**
 * 認証チェックリポジトリインターフェース
 */
export interface IVerifyRepository {
    /**
     * ユーザーIDでユーザー情報を取得
     * @param userId ユーザーID
     */
    findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined>;
}
