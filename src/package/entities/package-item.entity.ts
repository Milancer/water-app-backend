import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Package } from './package.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('package_items')
export class PackageItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.packageItems, { onDelete: 'CASCADE' })
  package: Package;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: string;

  @ManyToOne(() => Inventory)
  inventoryItem: Inventory;

  @Column({ type: 'int' })
  quantity: number;
}
