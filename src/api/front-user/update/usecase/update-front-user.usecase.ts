import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../../../../constant";
import {
    FrontUserBirthday,
    FrontUserId,
    FrontUserName,
    RefreshToken,
} from "../../../../domain";
import type { Database } from "../../../../infrastructure/db";
import { UpdateFrontUserResponseDto, UpdateFrontUserResponseType } from "../dto";
import { UpdateFrontUserRepository } from "../repository";
import type { UpdateFrontUserSchemaType } from "../schema";
import { UpdateFrontUserService } from "../service";


type Output =
    | {
        success: true;
        status: ContentfulStatusCode;
        message: string;
        data: {
            response: UpdateFrontUserResponseType;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: ContentfulStatusCode;
        message: string;
    };

/**
 * ユーザー更新ユースケース
 */
export class UpdateFrontUserUseCase {

    private readonly service: UpdateFrontUserService;

    constructor(db: Database) {
        const repository = new UpdateFrontUserRepository(db);
        this.service = new UpdateFrontUserService(repository);
    }

    async execute(
        userId: FrontUserId,
        requestBody: UpdateFrontUserSchemaType
    ): Promise<Output> {

        const userName = new FrontUserName(requestBody.userName);
        const userBirthday = new FrontUserBirthday(requestBody.userBirthday);

        // ユーザー名重複チェック（自身を除く）
        if (await this.service.checkUserNameExists(userId, userName)) {
            return {
                success: false,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                message: "既にユーザーが存在しています。",
            };
        }

        // ログイン情報を更新
        await this.service.updateFrontLoginUser(userId, userName.value);

        // ユーザー情報を更新
        const updated = await this.service.updateFrontUser(
            userId,
            userName.value,
            userBirthday.value
        );

        if (!updated) {
            return {
                success: false,
                status: HTTP_STATUS.NOT_FOUND,
                message: "ユーザーが見つかりません。",
            };
        }

        // 新しいリフレッシュトークンを発行
        const refreshToken = await RefreshToken.create(userId);

        const responseDto = new UpdateFrontUserResponseDto(
            updated.userId,
            updated.userName,
            updated.userBirthday
        );

        return {
            success: true,
            status: HTTP_STATUS.OK,
            message: "ユーザー情報の更新が完了しました。",
            data: {
                response: responseDto.value,
                refreshToken: refreshToken.value,
            },
        };
    }
}
