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
    // 機能制御
    ALLOW_USER_OPERATION: string;
    ENV_PRODUCTION: string;
  };
  Variables: {
    requestId: string;
    user?: AuthUserType;
  };
};
