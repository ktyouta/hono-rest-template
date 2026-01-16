import type { FrontUserMaster } from "../../../infrastructure/db";

/**
 * ログインレスポンスの型
 */
export type FrontUserLoginResponseType = {
  accessToken: string;
  user: {
    userId: number;
    userName: string;
    birthday: string;
  };
};

/**
 * ログインレスポンスDTO
 */
export class FrontUserLoginResponseDto {
  private readonly _value: FrontUserLoginResponseType;

  constructor(userInfo: FrontUserMaster, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        userId: userInfo.userId,
        userName: userInfo.userName,
        birthday: userInfo.userBirthday,
      },
    };
  }

  get value(): FrontUserLoginResponseType {
    return this._value;
  }
}
