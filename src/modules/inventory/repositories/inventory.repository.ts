import { BaseRepository } from '../../../core/abstract-repository';
import { Inventory } from '../entities/inventory.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryRepository extends BaseRepository<Inventory> {
  async findBySku(sku: string): Promise<Inventory | null> {
    return this.findOne({ where: { sku }, relations: [] });
  }

  async findLowStockItems(threshold: number): Promise<Inventory[]> {
    return this.createQueryBuilder('inventory')
      .where('inventory.quantity <= :threshold', { threshold })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async reserveStock(sku: string, quantity: number): Promise<Inventory> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      const inventory = await transactionalEntityManager
        .createQueryBuilder(Inventory, 'inventory')
        .setLock('pessimistic_write')
        .where('inventory.sku = :sku', { sku })
        .andWhere('inventory.isActive = :isActive', { isActive: true })
        .getOne();

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (!inventory.canReserve(quantity)) {
        throw new Error('Insufficient inventory');
      }

      inventory.reserve(quantity);
      return await transactionalEntityManager.save(inventory);
    });
  }
}
