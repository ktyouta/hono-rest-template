import type { FrontUserId } from "../domain";

/**
 * フロントユーザー情報型
 */
export type FrontUserInfoType = {
  userId: number;
  userName: string;
  birthday: string;
};

/**
 * 認証済みユーザー型
 */
export type AuthUserType = {
  userId: FrontUserId;
  info: FrontUserInfoType;
};

/**
 * Honoアプリケーション環境変数の型定義
 */
export type AppEnv = {
  Bindings: {
    DB: D1Database;
    // JWT認証キー
    ACCESS_TOKEN_JWT_KEY: string;
    ACCESS_TOKEN_EXPIRES: string;
    REFRESH_TOKEN_JWT_KEY: string;
    REFRESH_TOKEN_EXPIRES: string;
    // パスワード
    PEPPER: string;
    // CORS
    CORS_ORIGIN: string;
    // 機能制御
    ALLOW_USER_OPERATION: string;
    ENV_PRODUCTION: string;
  };
  Variables: {
    requestId: string;
    user?: AuthUserType;
  };
};
