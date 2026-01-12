/**
 * 環境変数設定
 * Cloudflare Workers環境ではenv bindingsから取得
 */
export type EnvConfig = {
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

/**
 * 環境フラグを取得
 */
export function getEnvFlags(env: Partial<EnvConfig>) {
  return {
    isProduction: env.ENV_PRODUCTION === "true",
    allowUserOperation: env.ALLOW_USER_OPERATION === "true",
  };
}
