import type { ContentfulStatusCode } from "hono/utils/http-status";
import { envConfig } from "../../../../config";
import { HTTP_STATUS } from "../../../../constant";
import {
    AccessToken,
    FrontUserBirthday,
    FrontUserName,
    FrontUserPassword,
    FrontUserSalt,
    Pepper,
    RefreshToken,
} from "../../../../domain";
import type { Database } from "../../../../infrastructure/db";
import { CreateFrontUserResponseDto, CreateFrontUserResponseType } from "../dto";
import { FrontUserEntity, FrontUserLoginEntity } from "../entity";
import { CreateFrontUserRepository } from "../repository";
import type { CreateFrontUserSchemaType } from "../schema";
import { CreateFrontUserService } from "../service";


type Output =
    | {
        success: true;
        status: ContentfulStatusCode;
        message: string;
        data: {
            response: CreateFrontUserResponseType;
            refreshToken: string;
        };
    }
    | {
        success: false;
        status: ContentfulStatusCode;
        message: string;
    };

/**
 * ユーザー作成ユースケース
 */
export class CreateFrontUserUseCase {

    private readonly service: CreateFrontUserService;

    constructor(private readonly db: Database) {
        const repository = new CreateFrontUserRepository(db);
        this.service = new CreateFrontUserService(repository, db);
    }

    async execute(requestBody: CreateFrontUserSchemaType): Promise<Output> {

        // ドメインオブジェクトを生成
        const userName = new FrontUserName(requestBody.userName);
        const userBirthday = new FrontUserBirthday(requestBody.userBirthday);
        const salt = FrontUserSalt.generate();
        const pepper = new Pepper(envConfig.pepper);
        const userPassword = await FrontUserPassword.hash(
            requestBody.password,
            salt,
            pepper
        );

        // ユーザー名重複チェック
        if (await this.service.checkUserNameExists(userName)) {
            return {
                success: false,
                status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
                message: "既にユーザーが存在しています。",
            };
        }

        // ユーザーIDを採番
        const frontUserId = await this.service.createUserId();

        // ログイン情報を挿入
        const loginUserEntity = new FrontUserLoginEntity(
            frontUserId,
            userName,
            userPassword,
            salt
        );
        await this.service.insertFrontLoginUser(loginUserEntity);

        // ユーザー情報を挿入
        const userEntity = new FrontUserEntity(frontUserId, userName, userBirthday);
        await this.service.insertFrontUser(userEntity);

        // トークンを発行
        const accessToken = await AccessToken.create(frontUserId);
        const refreshToken = await RefreshToken.create(frontUserId);

        const responseDto = new CreateFrontUserResponseDto(
            userEntity,
            accessToken.token
        );

        return {
            success: true,
            status: HTTP_STATUS.CREATED,
            message: "ユーザー情報の登録が完了しました。",
            data: {
                response: responseDto.value,
                refreshToken: refreshToken.value,
            },
        };
    }
}
