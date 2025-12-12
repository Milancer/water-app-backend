import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { PackageItem } from './entities/package-item.entity';
import { UserPackage } from './entities/user-package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AssignPackageDto } from './dto/assign-package.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(PackageItem)
    private packageItemRepository: Repository<PackageItem>,
    @InjectRepository(UserPackage)
    private userPackageRepository: Repository<UserPackage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createPackageDto: CreatePackageDto,
    companyId: string,
  ): Promise<Package> {
    // Create package
    const pkg = this.packageRepository.create({
      name: createPackageDto.name,
      description: createPackageDto.description,
      companyId,
    });

    const savedPackage = await this.packageRepository.save(pkg);

    // Create package items
    const packageItems = createPackageDto.items.map((item) =>
      this.packageItemRepository.create({
        packageId: savedPackage.id,
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
      }),
    );

    await this.packageItemRepository.save(packageItems);

    // Return package with items
    return this.findOne(savedPackage.id, companyId);
  }

  async findAll(companyId: string): Promise<Package[]> {
    return this.packageRepository.find({
      where: { companyId },
      relations: ['packageItems', 'packageItems.inventoryItem', 'userPackages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id, companyId },
      relations: ['packageItems', 'packageItems.inventoryItem', 'userPackages'],
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
    companyId: string,
  ): Promise<Package> {
    const pkg = await this.findOne(id, companyId);

    // Update basic fields
    if (updatePackageDto.name) pkg.name = updatePackageDto.name;
    if (updatePackageDto.description !== undefined)
      pkg.description = updatePackageDto.description;

    await this.packageRepository.save(pkg);

    // Update items if provided
    if (updatePackageDto.items) {
      // Delete existing items
      await this.packageItemRepository.delete({ packageId: id });

      // Create new items
      const packageItems = updatePackageDto.items.map((item) =>
        this.packageItemRepository.create({
          packageId: id,
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
        }),
      );

      await this.packageItemRepository.save(packageItems);
    }

    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const pkg = await this.findOne(id, companyId);
    await this.packageRepository.remove(pkg);
  }

  async assignToUsers(
    id: string,
    assignPackageDto: AssignPackageDto,
    companyId: string,
  ): Promise<UserPackage[]> {
    const pkg = await this.findOne(id, companyId);

    // Verify all users belong to the company
    const users = await this.userRepository.find({
      where: assignPackageDto.userIds.map((userId) => ({
        id: userId,
        companyId,
      })),
    });

    if (users.length !== assignPackageDto.userIds.length) {
      throw new ForbiddenException(
        'One or more users do not belong to your company',
      );
    }

    // Create user package assignments
    const userPackages = assignPackageDto.userIds.map((userId) =>
      this.userPackageRepository.create({
        userId,
        packageId: id,
      }),
    );

    return this.userPackageRepository.save(userPackages);
  }

  async getPackageUsers(id: string, companyId: string): Promise<UserPackage[]> {
    await this.findOne(id, companyId); // Verify package exists and belongs to company

    return this.userPackageRepository.find({
      where: { packageId: id },
      relations: ['user', 'redemptions'],
      order: { assignedDate: 'DESC' },
    });
  }
}
