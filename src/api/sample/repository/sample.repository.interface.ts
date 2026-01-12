import type { Sample } from "../../../infrastructure/db";

/**
 * サンプル作成入力型
 */
export type CreateSampleInput = {
  name: string;
  description?: string | null;
};

/**
 * サンプル更新入力型
 */
export type UpdateSampleInput = {
  name?: string;
  description?: string;
};

/**
 * サンプルリポジトリインターフェース
 */
export interface ISampleRepository {
  /**
   * 全件取得
   */
  findAll(): Promise<Sample[]>;

  /**
   * ID指定で取得
   * @param id サンプルID
   */
  findById(id: number): Promise<Sample | undefined>;

  /**
   * 作成
   * @param data 作成データ
   */
  create(data: CreateSampleInput): Promise<Sample>;

  /**
   * 更新
   * @param id サンプルID
   * @param data 更新データ
   */
  update(id: number, data: UpdateSampleInput): Promise<Sample | undefined>;

  /**
   * 削除（論理削除）
   * @param id サンプルID
   */
  delete(id: number): Promise<boolean>;
}
