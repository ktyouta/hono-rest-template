import { eq, and } from "drizzle-orm";
import type { Database, Sample } from "../../../infrastructure/db";
import { samples } from "../../../infrastructure/db";
import { FLG } from "../../../const";
import type {
  ISampleRepository,
  CreateSampleInput,
  UpdateSampleInput,
} from "./sample.repository.interface";

/**
 * サンプルリポジトリ実装
 */
export class SampleRepository implements ISampleRepository {
  constructor(private readonly db: Database) {}

  /**
   * 全件取得（論理削除されていないもの）
   */
  async findAll(): Promise<Sample[]> {
    return await this.db
      .select()
      .from(samples)
      .where(eq(samples.deleteFlg, FLG.OFF));
  }

  /**
   * ID指定で取得
   */
  async findById(id: number): Promise<Sample | undefined> {
    const result = await this.db
      .select()
      .from(samples)
      .where(and(eq(samples.id, id), eq(samples.deleteFlg, FLG.OFF)));
    return result[0];
  }

  /**
   * 作成
   */
  async create(data: CreateSampleInput): Promise<Sample> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(samples)
      .values({
        name: data.name,
        description: data.description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  /**
   * 更新
   */
  async update(id: number, data: UpdateSampleInput): Promise<Sample | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(samples)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(samples.id, id), eq(samples.deleteFlg, FLG.OFF)))
      .returning();
    return result[0];
  }

  /**
   * 削除（論理削除）
   */
  async delete(id: number): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(samples)
      .set({
        deleteFlg: FLG.ON,
        updatedAt: now,
      })
      .where(and(eq(samples.id, id), eq(samples.deleteFlg, FLG.OFF)))
      .returning();
    return result.length > 0;
  }
}
