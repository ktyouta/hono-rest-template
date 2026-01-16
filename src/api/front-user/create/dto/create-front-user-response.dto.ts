import { FrontUserEntity } from "../entity";

/**
 * ユーザー作成レスポンスの型
 */
export type CreateFrontUserResponseType = {
  accessToken: string;
  user: {
    userId: number;
    userName: string;
    birthday: string;
  };
};

/**
 * ユーザー作成レスポンスDTO
 */
export class CreateFrontUserResponseDto {
  private readonly _value: CreateFrontUserResponseType;

  constructor(entity: FrontUserEntity, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        userId: entity.frontUserId,
        userName: entity.frontUserName,
        birthday: entity.frontUserBirthday,
      },
    };
  }

  get value(): CreateFrontUserResponseType {
    return this._value;
  }
}
