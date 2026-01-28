import { sign, verify } from "hono/jwt";
import { envConfig } from "../../config";
import { parseDuration } from "../../util";
import { FrontUserId } from "../front-user-id";


export class RefreshToken {

    // トークン
    private readonly _value: string;
    // cookieのキー
    static readonly COOKIE_KEY: string = `refresh_token`;

    private constructor(token: string) {
        this._value = token;
    }

    /**
     * cookieオプション(生成)を取得
     * @returns
     */
    static get COOKIE_SET_OPTION() {

        const isProduction = envConfig.isProduction;
        const expires = envConfig.refreshTokenExpires;

        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? `none` as const : `lax` as const,
            maxAge: parseDuration(expires) / 1000,
            path: `/`,
        };
    }

    /**
     * cookieオプション(失効)を取得
     * @returns
     */
    static get COOKIE_CLEAR_OPTION() {

        const isProduction = envConfig.isProduction;

        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? `none` as const : `lax` as const,
            path: `/`,
            maxAge: 0,
        };
    }

    /**
     * トークンを取得
     * @param cookieValue
     * @returns
     */
    static get(cookieValue: string | undefined) {

        if (!cookieValue) {
            throw Error(`トークンが存在しません。`);
        }

        return new RefreshToken(cookieValue);
    }

    /**
     * トークンの発行
     * @param frontUserId
     * @returns
     */
    static async create(frontUserId: FrontUserId) {

        const jwtKey = envConfig.refreshTokenJwtKey;
        const expires = envConfig.refreshTokenExpires;

        if (!jwtKey) {
            throw Error(`設定ファイルにjwt(リフレッシュ)の秘密鍵が設定されていません。`);
        }

        if (!expires) {
            throw Error(`設定ファイルにリフレッシュトークンの有効期限が設定されていません。`);
        }

        const id = frontUserId.value;

        if (!id) {
            throw Error(`リフレッシュトークンの作成にはユーザーIDが必要です。`);
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresSec = parseDuration(expires) / 1000;

        const payload = {
            sub: `${id}`,
            iat: now,
            exp: now + expiresSec,
            sessionStartedAt: now,
        };

        const token = await sign(payload, jwtKey);

        return new RefreshToken(token);
    }

    /**
     * トークン再発行
     */
    async refresh() {

        const jwtKey = envConfig.refreshTokenJwtKey;
        const expires = envConfig.refreshTokenExpires;
        const decoded = await this.verify();

        const now = Math.floor(Date.now() / 1000);
        const expiresSec = parseDuration(expires) / 1000;

        if (!decoded.sub || !decoded.iat) {
            throw Error(`Claimの設定が不足しています。`);
        }

        const payload = {
            sub: decoded.sub,
            iat: decoded.iat,
            exp: now + expiresSec,
            sessionStartedAt: now,
        };

        const token = await sign(payload, jwtKey);

        return new RefreshToken(token);
    }

    /**
     * トークンチェック
     * @returns
     */
    private async verify() {

        const jwtKey = envConfig.refreshTokenJwtKey;

        try {

            const decoded = await verify(this.value, jwtKey);

            if (!decoded || typeof decoded !== `object`) {
                throw Error(`リフレッシュトークンが不正です。`);
            }

            return decoded;
        } catch (err) {
            throw Error(`リフレッシュトークンの検証に失敗しました。${err}`);
        }
    }

    /**
     * トークンのペイロードを取得
     * @returns
     */
    async getPayload() {

        const decode = await this.verify();

        if (!decode.sub) {
            throw new Error(`subが設定されていません。`);
        }

        const userId = Number(decode.sub);

        if (Number.isNaN(userId)) {
            throw new Error(`ユーザーIDが不正です。`);
        }

        return FrontUserId.of(userId);
    }

    /**
     * 絶対期限チェック
     */
    async isAbsoluteExpired() {

        const expires = envConfig.refreshTokenExpires;
        const decode = await this.verify();

        if (!decode.iat) {
            throw new Error(`iatが設定されていません。`);
        }

        const nowMs = Date.now();
        const iatMs = (decode.iat as number) * 1000;

        return nowMs - iatMs > parseDuration(expires);
    }

    get value() {
        return this._value;
    }
}
