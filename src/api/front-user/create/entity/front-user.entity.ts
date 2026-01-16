import {
  FrontUserId,
  FrontUserName,
  FrontUserBirthday,
} from "../../../../domain";

/**
 * フロントユーザーエンティティ
 */
export class FrontUserEntity {
  private readonly _frontUserId: FrontUserId;
  private readonly _frontUserName: FrontUserName;
  private readonly _frontUserBirthday: FrontUserBirthday;

  constructor(
    userId: FrontUserId,
    userName: FrontUserName,
    userBirthday: FrontUserBirthday
  ) {
    this._frontUserId = userId;
    this._frontUserName = userName;
    this._frontUserBirthday = userBirthday;
  }

  get frontUserId(): number {
    return this._frontUserId.value;
  }

  get frontUserName(): string {
    return this._frontUserName.value;
  }

  get frontUserBirthday(): string {
    return this._frontUserBirthday.value;
  }
}
