import { HTTP_STATUS } from "../../../../const";
import type { Database } from "../../../../infrastructure/db";
import { FrontUserId } from "../../../../domain";
import { DeleteFrontUserRepository } from "../repository";
import { DeleteFrontUserService } from "../service";

type Output =
  | {
      success: true;
      status: number;
      message: string;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

/**
 * ユーザー削除ユースケース
 */
export class DeleteFrontUserUseCase {
  private readonly service: DeleteFrontUserService;

  constructor(db: Database) {
    const repository = new DeleteFrontUserRepository(db);
    this.service = new DeleteFrontUserService(repository);
  }

  async execute(userId: FrontUserId): Promise<Output> {
    // ログイン情報を削除
    await this.service.deleteFrontLoginUser(userId);

    // ユーザー情報を削除
    const deleted = await this.service.deleteFrontUser(userId);

    if (!deleted) {
      return {
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "ユーザーが見つかりません。",
      };
    }

    return {
      success: true,
      status: HTTP_STATUS.NO_CONTENT,
      message: "ユーザーの削除が完了しました。",
    };
  }
}
