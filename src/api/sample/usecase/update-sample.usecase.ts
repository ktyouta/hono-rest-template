import { HTTP_STATUS } from "../../../const";
import type { SampleResponseType } from "../dto";
import { SampleResponseDto } from "../dto";
import type { SampleService } from "../service";
import type { UpdateSampleSchemaType } from "../schema";

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
 * サンプル更新ユースケース
 */
export class UpdateSampleUseCase {
  constructor(private readonly service: SampleService) {}

  async execute(id: number, input: UpdateSampleSchemaType): Promise<Output> {
    const entity = await this.service.update(id, input.name, input.description);

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
      message: "サンプルを更新しました。",
      data: responseDto.value,
    };
  }
}
