import { HTTP_STATUS } from "../../../const";
import type { SampleResponseType } from "../dto";
import { SampleResponseDto } from "../dto";
import type { SampleService } from "../service";
import type { CreateSampleSchemaType } from "../schema";

type Output = {
  status: number;
  message: string;
  data: SampleResponseType;
};

/**
 * サンプル作成ユースケース
 */
export class CreateSampleUseCase {
  constructor(private readonly service: SampleService) {}

  async execute(input: CreateSampleSchemaType): Promise<Output> {
    const entity = await this.service.create(input.name, input.description);
    const responseDto = new SampleResponseDto(entity);

    return {
      status: HTTP_STATUS.CREATED,
      message: "サンプルを作成しました。",
      data: responseDto.value,
    };
  }
}
