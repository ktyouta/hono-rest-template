import { HTTP_STATUS } from "../../../const";
import type { Database } from "../../../infrastructure/db";
import {
  FrontUserName,
  FrontUserId,
  FrontUserSalt,
  FrontUserPassword,
  Pepper,
  AccessToken,
  RefreshToken,
} from "../../../domain";
import { FrontUserLoginRepository } from "../repository";
import { FrontUserLoginService } from "../service";
import { FrontUserLoginResponseDto, FrontUserLoginResponseType } from "../dto";
import type { FrontUserLoginSchemaType } from "../schema";

type Output =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        response: FrontUserLoginResponseType;
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

  async execute(
    requestBody: FrontUserLoginSchemaType,
    env: EnvConfig
  ): Promise<Output> {
    // ユーザー名からログイン情報を取得
    const userName = new FrontUserName(requestBody.userName);
    const loginInfo = await this.service.getLoginUser(userName);

    if (!loginInfo) {
      return this.unauthorized();
    }

    // パスワード検証
    const frontUserId = FrontUserId.of(loginInfo.userId);
    const salt = FrontUserSalt.of(loginInfo.salt);
    const pepper = new Pepper(env.pepper);
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
