import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../../../../constant";
import type { UpdateSampleResponseType } from "../dto";
import { UpdateSampleResponseDto } from "../dto";
import type { UpdateSampleSchemaType } from "../schema";
import type { UpdateSampleService } from "../service";

type Output =
  | {
    success: true;
    status: ContentfulStatusCode;
    message: string;
    data: UpdateSampleResponseType;
  }
  | {
    success: false;
    status: ContentfulStatusCode;
    message: string;
  };

/**
 * サンプル更新ユースケース
 */
export class UpdateSampleUseCase {
  constructor(private readonly service: UpdateSampleService) { }

  async execute(id: number, input: UpdateSampleSchemaType): Promise<Output> {
    const entity = await this.service.update(id, input.name, input.description);

    if (!entity) {
      return {
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "サンプルが見つかりません。",
      };
    }

    const responseDto = new UpdateSampleResponseDto(entity);

    return {
      success: true,
      status: HTTP_STATUS.OK,
      message: "サンプルを更新しました。",
      data: responseDto.value,
    };
  }
}
