import { HTTP_STATUS } from "../../../const";
import type { SampleResponseType } from "../dto";
import { SampleListResponseDto } from "../dto";
import type { SampleService } from "../service";

type Output = {
  status: number;
  message: string;
  data: SampleResponseType[];
};

/**
 * サンプル一覧取得ユースケース
 */
export class GetSamplesUseCase {
  constructor(private readonly service: SampleService) {}

  async execute(): Promise<Output> {
    const entities = await this.service.findAll();
    const responseDto = new SampleListResponseDto(entities);

    return {
      status: HTTP_STATUS.OK,
      message: "サンプル一覧を取得しました。",
      data: responseDto.value,
    };
  }
}
