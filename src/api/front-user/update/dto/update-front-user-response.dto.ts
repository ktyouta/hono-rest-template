/**
 * ユーザー更新レスポンスの型
 */
export type UpdateFrontUserResponseType = {
  user: {
    userId: number;
    userName: string;
    birthday: string;
  };
};

/**
 * ユーザー更新レスポンスDTO
 */
export class UpdateFrontUserResponseDto {
  private readonly _value: UpdateFrontUserResponseType;

  constructor(userId: number, userName: string, birthday: string) {
    this._value = {
      user: {
        userId,
        userName,
        birthday,
      },
    };
  }

  get value(): UpdateFrontUserResponseType {
    return this._value;
  }
}
