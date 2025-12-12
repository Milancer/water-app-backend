import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Package } from './package.entity';
import { User } from '../../user/entities/user.entity';
import { Redemption } from './redemption.entity';

export enum UserPackageStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('user_packages')
export class UserPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ name: 'package_id' })
  packageId: string;

  @ManyToOne(() => Package, (pkg) => pkg.userPackages)
  package: Package;

  @CreateDateColumn({ name: 'assigned_date' })
  assignedDate: Date;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: UserPackageStatus,
    default: UserPackageStatus.ACTIVE,
  })
  status: UserPackageStatus;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completedDate: Date;

  @OneToMany(() => Redemption, (redemption) => redemption.userPackage)
  redemptions: Redemption[];
}
