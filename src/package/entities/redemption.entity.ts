import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserPackage } from './user-package.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { User } from '../../user/entities/user.entity';

@Entity('redemptions')
export class Redemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_package_id' })
  userPackageId: string;

  @ManyToOne(() => UserPackage, (userPackage) => userPackage.redemptions)
  userPackage: UserPackage;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: string;

  @ManyToOne(() => Inventory)
  inventoryItem: Inventory;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn({ name: 'redeemed_date' })
  redeemedDate: Date;

  @Column({ name: 'redeemed_by_user_id' })
  redeemedByUserId: string;

  @ManyToOne(() => User)
  redeemedByUser: User;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
