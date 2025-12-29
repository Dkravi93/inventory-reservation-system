// modules/inventory/services/inventory.service.ts
import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { InventoryRepository } from '../repositories/inventory.repository';
import { Inventory } from '../entities/inventory.entity';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { InventoryCacheService } from './inventory-cache.service';
import events, { EventEmitter } from 'events';

@Injectable()
export class InventoryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InventoryService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(InventoryRepository)
    private readonly inventoryRepository: InventoryRepository,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly cacheService: InventoryCacheService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async onModuleInit() {
    // Subscribe to inventory events
    await this.setupSubscriptions();
  }

  onModuleDestroy() {
    // Cleanup if needed
  }

  private async setupSubscriptions() {
    // Subscribe to Redis channels for real-time updates
    await this.redisClient.subscribe('inventory:updates');

    this.redisClient.on('message', (channel, message) => {
      if (channel === 'inventory:updates') {
        this.handleInventoryUpdate(JSON.parse(message));
      }
    });
  }

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const inventory =
      await this.inventoryRepository.createEntity(createInventoryDto);

    // Invalidate cache
    await this.cacheService.invalidateCache(`inventory:${inventory.sku}`);

    // Emit event
    this.eventEmitter.emit('inventory.created', inventory);

    // Publish to Redis
    await this.redisClient.publish(
      'inventory:updates',
      JSON.stringify({
        type: 'CREATED',
        data: inventory,
        timestamp: new Date().toISOString(),
      }),
    );

    return inventory;
  }

  async findBySku(sku: string): Promise<Inventory | null> {
    // Try cache first
    const cached = await this.cacheService.getFromCache(`inventory:${sku}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const inventory = await this.inventoryRepository.findBySku(sku);

    if (inventory) {
      // Cache the result
      await this.cacheService.setCache(
        `inventory:${sku}`,
        JSON.stringify(inventory),
        this.CACHE_TTL,
      );
    }

    return inventory;
  }

  async reserveStock(sku: string, quantity: number): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.reserveStock(
        sku,
        quantity,
      );

      // Update cache
      await this.cacheService.invalidateCache(`inventory:${sku}`);

      // Emit event
      this.eventEmitter.emit('inventory.reserved', {
        sku,
        quantity,
        inventory,
      });

      return inventory;
    } catch (error) {
      this.logger.error(`Failed to reserve stock for ${sku}:`, error);
      throw error;
    }
  }

  async updateStock(
    sku: string,
    quantityChange: number,
    action: 'ADD' | 'REMOVE',
  ): Promise<Inventory> {
    return this.inventoryRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const inventory = await transactionalEntityManager
          .createQueryBuilder(Inventory, 'inventory')
          .setLock('pessimistic_write')
          .where('inventory.sku = :sku', { sku })
          .getOne();

        if (!inventory) {
          throw new Error('Inventory not found');
        }

        if (action === 'ADD') {
          inventory.quantity += quantityChange;
        } else {
          if (inventory.availableQuantity < quantityChange) {
            throw new Error('Insufficient inventory');
          }
          inventory.quantity -= quantityChange;
        }

        const updated = await transactionalEntityManager.save(inventory);

        // Update cache
        await this.cacheService.setCache(
          `inventory:${sku}`,
          JSON.stringify(updated),
          this.CACHE_TTL,
        );

        return updated;
      },
    );
  }

  async getLowStockAlerts(threshold: number): Promise<Inventory[]> {
    const cacheKey = `inventory:low-stock:${threshold}`;

    // Try cache first
    const cached = await this.cacheService.getFromCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const lowStockItems =
      await this.inventoryRepository.findLowStockItems(threshold);

    // Cache with shorter TTL for frequently changing data
    await this.cacheService.setCache(
      cacheKey,
      JSON.stringify(lowStockItems),
      60,
    );

    return lowStockItems;
  }

  private handleInventoryUpdate(update: any) {
    this.logger.debug(`Received inventory update: ${update.type}`);
    // Handle the update as needed
  }
}
