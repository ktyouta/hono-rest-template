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
    CORS_ORIGIN: string[];

    // 機能制御
    ALLOW_USER_OPERATION: string;
    ENV_PRODUCTION: string;
};


/**
 * 環境変数のシングルトン
 */
class EnvConfigSingleton {

    private _accessTokenJwtKey: string = ``;
    private _accessTokenExpires: string = ``;
    private _refreshTokenJwtKey: string = ``;
    private _refreshTokenExpires: string = ``;
    private _pepper: string = ``;
    private _corsOrigin: string[] = [];
    private _isProduction: boolean = false;

    /**
     * 環境変数を初期化
     */
    init(env: Partial<EnvConfig>) {
        this._accessTokenJwtKey = env.ACCESS_TOKEN_JWT_KEY || ``;
        this._accessTokenExpires = env.ACCESS_TOKEN_EXPIRES || ``;
        this._refreshTokenJwtKey = env.REFRESH_TOKEN_JWT_KEY || ``;
        this._refreshTokenExpires = env.REFRESH_TOKEN_EXPIRES || ``;
        this._pepper = env.PEPPER || ``;
        this._corsOrigin = env.CORS_ORIGIN || [];
        this._isProduction = env.ENV_PRODUCTION === `true`;
    }

    get accessTokenJwtKey() {
        return this._accessTokenJwtKey;
    }

    get accessTokenExpires() {
        return this._accessTokenExpires;
    }

    get refreshTokenJwtKey() {
        return this._refreshTokenJwtKey;
    }

    get refreshTokenExpires() {
        return this._refreshTokenExpires;
    }

    get pepper() {
        return this._pepper;
    }

    get corsOrigin() {
        return this._corsOrigin;
    }

    get isProduction() {
        return this._isProduction;
    }
}

export const envConfig = new EnvConfigSingleton();


/**
 * 環境フラグを取得
 */
export function getEnvFlags(env: Partial<EnvConfig>) {
    return {
        isProduction: env.ENV_PRODUCTION === "true",
        allowUserOperation: env.ALLOW_USER_OPERATION === "true",
    };
}
