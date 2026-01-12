import { HTTP_STATUS } from "../../../const";
import type { SampleResponseType } from "../dto";
import { SampleResponseDto } from "../dto";
import type { SampleService } from "../service";

type Output =
  | {
      success: true;
      status: number;
      message: string;
      data: SampleResponseType;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

/**
 * サンプル取得ユースケース
 */
export class GetSampleUseCase {
  constructor(private readonly service: SampleService) {}

  async execute(id: number): Promise<Output> {
    const entity = await this.service.findById(id);

    if (!entity) {
      return {
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "サンプルが見つかりません。",
      };
    }

    const responseDto = new SampleResponseDto(entity);

    return {
      success: true,
      status: HTTP_STATUS.OK,
      message: "サンプルを取得しました。",
      data: responseDto.value,
    };
  }
}
