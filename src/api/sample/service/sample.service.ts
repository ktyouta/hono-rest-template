import type { ISampleRepository } from "../repository";
import { SampleEntity } from "../entity";

/**
 * サンプルサービス
 */
export class SampleService {
  constructor(private readonly repository: ISampleRepository) {}

  /**
   * 全件取得
   */
  async findAll(): Promise<SampleEntity[]> {
    const records = await this.repository.findAll();
    return records.map((record) => SampleEntity.fromRecord(record));
  }

  /**
   * ID指定で取得
   * @param id サンプルID
   */
  async findById(id: number): Promise<SampleEntity | null> {
    const record = await this.repository.findById(id);
    if (!record) {
      return null;
    }
    return SampleEntity.fromRecord(record);
  }

  /**
   * 作成
   * @param name 名前
   * @param description 説明
   */
  async create(name: string, description?: string): Promise<SampleEntity> {
    const record = await this.repository.create({
      name,
      description: description ?? null,
    });
    return SampleEntity.fromRecord(record);
  }

  /**
   * 更新
   * @param id サンプルID
   * @param name 名前
   * @param description 説明
   */
  async update(
    id: number,
    name?: string,
    description?: string
  ): Promise<SampleEntity | null> {
    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const record = await this.repository.update(id, updateData);
    if (!record) {
      return null;
    }
    return SampleEntity.fromRecord(record);
  }

  /**
   * 削除
   * @param id サンプルID
   */
  async delete(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
