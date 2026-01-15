import { sign, verify } from "hono/jwt";
import { envConfig } from "../../config";
import { parseDuration } from "../../util";
import { FrontUserId } from "../front-user-id";
import { Header } from "../header/header";
import { AccessTokenError } from "./access-token.error";


export class AccessToken {

    // トークン
    private readonly _value: string;
    // ヘッダーのキー
    static readonly HEADER_KEY: string = `Authorization`;
    // 認証スキーム
    static readonly SCHEME: string = `Bearer`;

    private constructor(token: string) {
        this._value = token;
    }

    /**
     * トークンを取得
     * @param header
     * @returns
     */
    static get(header: Header) {

        const authHeader = header.get(AccessToken.HEADER_KEY) || ``;
        const [scheme, token] = authHeader.split(` `);

        const accessToken = scheme === AccessToken.SCHEME && token ? token : ``;

        if (!accessToken) {
            throw new AccessTokenError(`Authorizationヘッダの形式が不正です。`);
        }

        return new AccessToken(accessToken);
    }

    /**
     * トークンの発行
     * @param frontUserId
     * @returns
     */
    static async create(frontUserId: FrontUserId) {

        const jwtKey = envConfig.accessTokenJwtKey;
        const expires = envConfig.accessTokenExpires;

        if (!jwtKey) {
            throw Error(`設定ファイルにjwt(アクセス)の秘密鍵が設定されていません。`);
        }

        if (!expires) {
            throw Error(`設定ファイルにアクセストークンの有効期限が設定されていません。`);
        }

        const id = frontUserId.value;

        if (!id) {
            throw Error(`アクセストークンの作成にはユーザーIDが必要です。`);
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresSec = parseDuration(expires) / 1000;

        const payload = {
            sub: `${id}`,
            iat: now,
            exp: now + expiresSec,
        };

        const token = await sign(payload, jwtKey);

        return new AccessToken(token);
    }

    /**
     * トークンチェック
     * @returns
     */
    private async verify() {

        const jwtKey = envConfig.accessTokenJwtKey;

        try {

            const decoded = await verify(this.token, jwtKey);

            if (!decoded || typeof decoded !== `object`) {
                throw new AccessTokenError(`アクセストークンが不正です。`);
            }

            return decoded;
        } catch (err) {
            throw new AccessTokenError(`アクセストークンの検証に失敗しました。${err}`);
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

    get token() {
        return this._value;
    }
}
