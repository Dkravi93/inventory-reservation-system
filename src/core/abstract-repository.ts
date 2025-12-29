// core/abstract-repository.ts
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseRepository<T> extends Repository<T> {
  async createEntity(data: Partial<T>): Promise<T> {
    const entity = this.create(data as QueryDeepPartialEntity<T>);
    return await this.save(entity);
  }

  async updateEntity(id: string | number, data: Partial<T>): Promise<T> {
    await this.update(id, data as QueryDeepPartialEntity<T>);
    return this.findOne(id);
  }

  async softDeleteEntity(id: string | number): Promise<void> {
    await this.softDelete(id);
  }

  async findWithPagination(
    page: number,
    limit: number,
    where?: any,
    relations?: string[],
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.findAndCount({
      where,
      relations,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }
}