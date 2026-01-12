import {
  FrontUserId,
  FrontUserName,
  FrontUserPassword,
  FrontUserSalt,
} from "../../../../domain";

/**
 * フロントユーザーログインエンティティ
 */
export class FrontUserLoginEntity {
  private readonly _frontUserId: FrontUserId;
  private readonly _frontUserName: FrontUserName;
  private readonly _frontUserPassword: FrontUserPassword;
  private readonly _salt: FrontUserSalt;

  constructor(
    userId: FrontUserId,
    userName: FrontUserName,
    password: FrontUserPassword,
    salt: FrontUserSalt
  ) {
    this._frontUserId = userId;
    this._frontUserName = userName;
    this._frontUserPassword = password;
    this._salt = salt;
  }

  get frontUserId(): number {
    return this._frontUserId.value;
  }

  get frontUserName(): string {
    return this._frontUserName.value;
  }

  get frontUserPassword(): string {
    return this._frontUserPassword.value;
  }

  get salt(): string {
    return this._salt.value;
  }
}
