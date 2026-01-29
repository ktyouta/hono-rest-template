import type { ContentfulStatusCode } from "hono/utils/http-status";
import { envConfig } from "../../../config";
import { HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    FrontUserId,
    FrontUserName,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
    RefreshToken,
} from "../../../domain";
import type { Database } from "../../../infrastructure/db";
import { FrontUserLoginResponseDto, FrontUserLoginResponseType } from "../dto";
import { FrontUserLoginRepository } from "../repository";
import type { FrontUserLoginSchemaType } from "../schema";
import { FrontUserLoginService } from "../service";


type Output =
    | {
        success: true;
        status: ContentfulStatusCode;
        message: string;
        data: {
            response: FrontUserLoginResponseType;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: ContentfulStatusCode;
        message: string;
    };

/**
 * ログインユースケース
 */
export class FrontUserLoginUseCase {

    private readonly service: FrontUserLoginService;

    constructor(db: Database) {
        const repository = new FrontUserLoginRepository(db);
        this.service = new FrontUserLoginService(repository);
    }

    private unauthorized(): Output {
        return {
            success: false,
            status: HTTP_STATUS.UNAUTHORIZED,
            message: "IDかパスワードが間違っています。",
        };
    }

    async execute(requestBody: FrontUserLoginSchemaType): Promise<Output> {

        // ユーザー名からログイン情報を取得
        const userName = new FrontUserName(requestBody.userName);
        const loginInfo = await this.service.getLoginUser(userName);

        if (!loginInfo) {
            return this.unauthorized();
        }

        // パスワード検証
        const frontUserId = FrontUserId.of(loginInfo.userId);
        const salt = FrontUserSalt.of(loginInfo.salt);
        const pepper = new Pepper(envConfig.pepper);
        const password = await FrontUserPassword.hash(
            requestBody.password,
            salt,
            pepper
        );

        if (password.value !== loginInfo.password) {
            return this.unauthorized();
        }

        // ユーザー情報を取得
        const userInfo = await this.service.getUserInfo(frontUserId);

        if (!userInfo) {
            return this.unauthorized();
        }

        // トークンを発行
        const accessToken = await AccessToken.create(frontUserId);
        const refreshToken = await RefreshToken.create(frontUserId);

        // 最終ログイン日時を更新
        await this.service.updateLastLoginDate(frontUserId);

        const responseDto = new FrontUserLoginResponseDto(
            userInfo,
            accessToken.token
        );

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "ログイン成功",
            data: {
                response: responseDto.value,
                refreshToken: refreshToken.value,
            },
        };
    }
}
