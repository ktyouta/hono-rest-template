import { HTTP_STATUS } from "../../../../const";
import type { Database } from "../../../../infrastructure/db";
import {
  FrontUserName,
  FrontUserBirthday,
  FrontUserSalt,
  FrontUserPassword,
  Pepper,
  AccessToken,
  RefreshToken,
} from "../../../../domain";
import { CreateFrontUserRepository } from "../repository";
import { CreateFrontUserService } from "../service";
import { FrontUserEntity, FrontUserLoginEntity } from "../entity";
import { CreateFrontUserResponseDto, CreateFrontUserResponseType } from "../dto";
import type { CreateFrontUserSchemaType } from "../schema";

type Output =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        response: CreateFrontUserResponseType;
        refreshToken: string;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

type EnvConfig = {
  accessTokenJwtKey: string;
  accessTokenExpires: number;
  refreshTokenJwtKey: string;
  refreshTokenExpires: number;
  pepper: string;
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

  async execute(
    requestBody: CreateFrontUserSchemaType,
    env: EnvConfig
  ): Promise<Output> {
    // ドメインオブジェクトを生成
    const userName = new FrontUserName(requestBody.userName);
    const userBirthday = new FrontUserBirthday(requestBody.userBirthday);
    const salt = FrontUserSalt.generate();
    const pepper = new Pepper(env.pepper);
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
    const accessToken = await AccessToken.create(
      frontUserId,
      env.accessTokenJwtKey,
      env.accessTokenExpires
    );
    const refreshToken = await RefreshToken.create(
      frontUserId,
      env.refreshTokenJwtKey,
      env.refreshTokenExpires
    );

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
