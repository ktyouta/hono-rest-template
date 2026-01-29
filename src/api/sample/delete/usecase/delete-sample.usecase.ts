import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../../../../constant";
import type { DeleteSampleService } from "../service";

type Output =
  | {
    success: true;
    status: ContentfulStatusCode;
    message: string;
  }
  | {
    success: false;
    status: ContentfulStatusCode;
    message: string;
  };

/**
 * サンプル削除ユースケース
 */
export class DeleteSampleUseCase {
  constructor(private readonly service: DeleteSampleService) { }

  async execute(id: number): Promise<Output> {
    const deleted = await this.service.delete(id);

    if (!deleted) {
      return {
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "サンプルが見つかりません。",
      };
    }

    return {
      success: true,
      status: HTTP_STATUS.OK,
      message: "サンプルを削除しました。",
    };
  }
}
