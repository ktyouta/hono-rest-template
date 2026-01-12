import { HTTP_STATUS } from "../../../const";
import type { Database } from "../../../infrastructure/db";
import { RefreshToken, AccessToken } from "../../../domain";
import { RefreshRepository } from "../repository";
import { RefreshService } from "../service";

type Output =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        accessToken: string;
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
  corsOrigin: string;
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
    csrfToken: string | undefined,
    env: EnvConfig
  ): Promise<Output> {
    // Origin チェック
    if (!origin || origin !== env.corsOrigin) {
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
      refreshToken = RefreshToken.fromCookie(refreshTokenValue);
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
      userId = await refreshToken.getPayload(env.refreshTokenJwtKey);
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
    const isExpired = await refreshToken.isAbsoluteExpired(
      env.refreshTokenJwtKey,
      env.refreshTokenExpires
    );
    if (isExpired) {
      return {
        success: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        message: "リフレッシュトークンの絶対期限切れ",
      };
    }

    // 新しいトークンを生成
    const newRefreshToken = await refreshToken.refresh(
      env.refreshTokenJwtKey,
      env.refreshTokenExpires
    );
    const accessToken = await AccessToken.create(
      userId,
      env.accessTokenJwtKey,
      env.accessTokenExpires
    );

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
