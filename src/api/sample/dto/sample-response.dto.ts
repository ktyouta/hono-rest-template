import { SampleEntity } from "../entity";

/**
 * サンプルレスポンスの型
 */
export type SampleResponseType = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * サンプルレスポンスDTO
 */
export class SampleResponseDto {
  private readonly _value: SampleResponseType;

  constructor(entity: SampleEntity) {
    this._value = {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  get value(): SampleResponseType {
    return this._value;
  }
}

/**
 * サンプル一覧レスポンスDTO
 */
export class SampleListResponseDto {
  private readonly _value: SampleResponseType[];

  constructor(entities: SampleEntity[]) {
    this._value = entities.map((entity) => new SampleResponseDto(entity).value);
  }

  get value(): SampleResponseType[] {
    return this._value;
  }
}
