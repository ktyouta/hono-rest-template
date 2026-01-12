/**
 * APIレスポンスの基本型
 */
export type ApiResponseType<T = undefined> = {
  status: number;
  message: string;
  data?: T;
};

/**
 * バリデーションエラーの型
 */
export type ValidationErrorType = {
  field: string;
  message: string;
};
