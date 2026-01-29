import { and, eq } from "drizzle-orm";
import { FLG } from "../../../constant";
import type { FrontUserId } from "../../../domain";
import type { Database, FrontUserMaster } from "../../../infrastructure/db";
import { frontUserMaster } from "../../../infrastructure/db";
import type { IVerifyRepository } from "./verify.repository.interface";

/**
 * 認証チェックリポジトリ実装
 */
export class VerifyRepository implements IVerifyRepository {
    constructor(private readonly db: Database) { }

    /**
     * ユーザーIDでユーザー情報を取得
     * @param userId ユーザーID
     */
    async findByUserId(userId: FrontUserId): Promise<FrontUserMaster | undefined> {
        const result = await this.db
            .select()
            .from(frontUserMaster)
            .where(
                and(
                    eq(frontUserMaster.userId, userId.value),
                    eq(frontUserMaster.deleteFlg, FLG.OFF)
                )
            );
        return result[0];
    }
}
