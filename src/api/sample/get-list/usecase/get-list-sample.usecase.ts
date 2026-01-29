import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTP_STATUS } from "../../../../constant";
import type { GetListSampleResponseType } from "../dto";
import { GetListSampleResponseDto } from "../dto";
import type { GetListSampleService } from "../service";

type Output = {
  status: ContentfulStatusCode;
  message: string;
  data: GetListSampleResponseType[];
};

/**
 * サンプル一覧取得ユースケース
 */
export class GetListSampleUseCase {
  constructor(private readonly service: GetListSampleService) { }

  async execute(): Promise<Output> {
    const entities = await this.service.findAll();
    const responseDto = new GetListSampleResponseDto(entities);

    return {
      status: HTTP_STATUS.OK,
      message: "サンプル一覧を取得しました。",
      data: responseDto.value,
    };
  }
}
