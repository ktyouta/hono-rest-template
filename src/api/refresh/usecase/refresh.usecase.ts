import type { ContentfulStatusCode } from "hono/utils/http-status";
import { envConfig } from "../../../config";
import { HTTP_STATUS } from "../../../constant";
import { AccessToken, RefreshToken } from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { RefreshRepository } from "../repository";
import { RefreshService } from "../service";


type Output =
    | {
        success: true;
        status: ContentfulStatusCode;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: ContentfulStatusCode;
        message: string;
    };

/**
 * リフレッシュユースケース
 */
export class RefreshUseCase {

    private readonly service: RefreshService;

    constructor(db: Database) {
        const repository = new RefreshRepository(db);
        this.service = new RefreshService(repository);
    }

    async execute(
        refreshTokenValue: string | undefined,
        origin: string | undefined,
        csrfToken: string | undefined
    ): Promise<Output> {

        // Origin チェック
        if (!origin || !envConfig.corsOrigin.includes(origin)) {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "許可されていないOrigin",
            };
        }

        // CSRFトークンチェック
        if (csrfToken !== "web") {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "カスタムヘッダが不正",
            };
        }

        // リフレッシュトークン取得
        let refreshToken: RefreshToken;
        try {
            refreshToken = RefreshToken.get(refreshTokenValue);
        } catch {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "リフレッシュトークンが見つかりません",
            };
        }

        // トークン検証・ユーザーID取得
        let userId;
        try {
            userId = await refreshToken.getPayload();
        } catch {
            return {
                success: false,
                status: HTTP_STATUS.UNAUTHORIZED,
                message: "リフレッシュトークンが無効です",
            };
        }

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
        const newRefreshToken = await refreshToken.refresh();
        const accessToken = await AccessToken.create(userId);

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "認証成功",
            data: {
                accessToken: accessToken.token,
                refreshToken: newRefreshToken.value,
            },
        };
    }
}
