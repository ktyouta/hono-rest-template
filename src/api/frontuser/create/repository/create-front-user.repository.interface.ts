import type { FrontUserMaster } from "../../../../infrastructure/db";
import type { FrontUserName } from "../../../../domain";
import type { FrontUserEntity, FrontUserLoginEntity } from "../entity";

/**
 * ユーザー作成リポジトリインターフェース
 */
export interface ICreateFrontUserRepository {
  /**
   * ユーザー名でユーザーを検索
   * @param userName ユーザー名
   */
  findByUserName(userName: FrontUserName): Promise<FrontUserMaster[]>;

  /**
   * ユーザー情報を挿入
   * @param entity ユーザーエンティティ
   */
  insertFrontUser(entity: FrontUserEntity): Promise<FrontUserMaster>;

  /**
   * ログイン情報を挿入
   * @param entity ログインエンティティ
   */
  insertFrontLoginUser(entity: FrontUserLoginEntity): Promise<void>;
}
