import { HTTP_STATUS } from "../../../../const";
import type { CreateSampleResponseType } from "../dto";
import { CreateSampleResponseDto } from "../dto";
import type { CreateSampleService } from "../service";
import type { CreateSampleSchemaType } from "../schema";

type Output = {
  status: number;
  message: string;
  data: CreateSampleResponseType;
};

/**
 * サンプル作成ユースケース
 */
export class CreateSampleUseCase {
  constructor(private readonly service: CreateSampleService) {}

  async execute(input: CreateSampleSchemaType): Promise<Output> {
    const entity = await this.service.create(input.name, input.description);
    const responseDto = new CreateSampleResponseDto(entity);

    return {
      status: HTTP_STATUS.CREATED,
      message: "サンプルを作成しました。",
      data: responseDto.value,
    };
  }
}
