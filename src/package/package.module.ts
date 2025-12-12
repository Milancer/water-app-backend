import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { Package } from './entities/package.entity';
import { PackageItem } from './entities/package-item.entity';
import { UserPackage } from './entities/user-package.entity';
import { Redemption } from './entities/redemption.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      PackageItem,
      UserPackage,
      Redemption,
      User,
    ]),
  ],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
