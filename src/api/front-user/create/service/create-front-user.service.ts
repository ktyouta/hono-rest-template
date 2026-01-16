import type { Database } from "../../../../infrastructure/db";
import { FrontUserId, FrontUserName, SeqKey, SeqIssue } from "../../../../domain";
import type { ICreateFrontUserRepository } from "../repository";
import type { FrontUserEntity, FrontUserLoginEntity } from "../entity";

/**
 * ユーザー作成サービス
 */
export class CreateFrontUserService {
  private static readonly SEQ_KEY = "front_user_id";

  constructor(
    private readonly repository: ICreateFrontUserRepository,
    private readonly db: Database
  ) {}

  /**
   * ユーザー名の重複チェック
   * @param userName ユーザー名
   */
  async checkUserNameExists(userName: FrontUserName): Promise<boolean> {
    const result = await this.repository.findByUserName(userName);
    return result.length > 0;
  }

  /**
   * ユーザーIDを採番
   */
  async createUserId(): Promise<FrontUserId> {
    const keyModel = new SeqKey(CreateFrontUserService.SEQ_KEY);
    const newId = await SeqIssue.get(keyModel, this.db);
    return FrontUserId.of(newId);
  }

  /**
   * ユーザー情報を挿入
   * @param entity ユーザーエンティティ
   */
  async insertFrontUser(entity: FrontUserEntity): Promise<void> {
    await this.repository.insertFrontUser(entity);
  }

  /**
   * ログイン情報を挿入
   * @param entity ログインエンティティ
   */
  async insertFrontLoginUser(entity: FrontUserLoginEntity): Promise<void> {
    await this.repository.insertFrontLoginUser(entity);
  }
}
