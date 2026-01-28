import { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../../../const";
import { AccessToken, RefreshToken } from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { AuthRepository } from "../repository/auth.repository";
import { AuthService } from "../service/auth.service";


type Output =
    | {
        success: true;
        status: ContentfulStatusCode;
        message: string;
        data: {
            accessToken: string;
        };
    }
    | {
        success: false;
        status: ContentfulStatusCode;
        message: string;
    };

/**
 * 認証チェックユースケース
 */
export class AuthUseCase {

    private readonly service: AuthService;

    constructor(db: Database) {
        const repository = new AuthRepository(db);
        this.service = new AuthService(repository);
    }

    async execute(
        refreshToken: RefreshToken
    ): Promise<Output> {

        // トークン検証・ユーザーID取得
        const userId = await refreshToken.getPayload();

        // ユーザー情報を取得
        const userInfo = await this.service.getUser(userId);

        if (!userInfo) {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "ユーザーが見つかりません",
            };
        }

        // 絶対期限チェック
        const isExpired = await refreshToken.isAbsoluteExpired();
        if (isExpired) {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "リフレッシュトークンの絶対期限切れ",
            };
        }

        // 新しいトークンを生成
        const accessToken = await AccessToken.create(userId);

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "認証成功",
            data: {
                accessToken: accessToken.token,
            },
        };
    }
}
