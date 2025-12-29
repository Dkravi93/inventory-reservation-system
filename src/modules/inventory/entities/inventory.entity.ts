// modules/inventory/entities/inventory.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('inventory')
@Index(['sku', 'warehouseId'], { unique: true })
@Index(['isActive'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'int', default: 0 })
  minimumStockLevel: number;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }

  canReserve(quantity: number): boolean {
    return this.availableQuantity >= quantity && this.isActive;
  }

  reserve(quantity: number): void {
    if (!this.canReserve(quantity)) {
      throw new Error('Insufficient inventory');
    }
    this.reservedQuantity += quantity;
  }

  release(quantity: number): void {
    if (this.reservedQuantity < quantity) {
      throw new Error('Cannot release more than reserved');
    }
    this.reservedQuantity -= quantity;
  }

  consume(quantity: number): void {
    if (this.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }
    this.quantity -= quantity;
    this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
  }
}
