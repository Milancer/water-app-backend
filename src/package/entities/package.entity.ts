import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { PackageItem } from './package-item.entity';
import { UserPackage } from './user-package.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.packages)
  company: Company;

  @OneToMany(() => PackageItem, (packageItem) => packageItem.package, {
    cascade: true,
  })
  packageItems: PackageItem[];

  @OneToMany(() => UserPackage, (userPackage) => userPackage.package)
  userPackages: UserPackage[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
