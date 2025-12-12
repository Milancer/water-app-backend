import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Package } from './entities/package.entity';
import { PackageItem } from './entities/package-item.entity';
import { UserPackage } from './entities/user-package.entity';
import { Redemption } from './entities/redemption.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AssignPackageDto } from './dto/assign-package.dto';
import { RedeemItemDto } from './dto/redeem-item.dto';
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
    @InjectRepository(Redemption)
    private redemptionRepository: Repository<Redemption>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createPackageDto: CreatePackageDto,
    companyId: string,
  ): Promise<Package> {
    console.log('Creating package with data:', createPackageDto);

    // Create package
    const pkg = this.packageRepository.create({
      name: createPackageDto.name,
      description: createPackageDto.description,
      companyId,
    });

    const savedPackage = await this.packageRepository.save(pkg);
    console.log('Package saved:', savedPackage.id);

    // Create package items
    const packageItems = createPackageDto.items.map((item) =>
      this.packageItemRepository.create({
        packageId: savedPackage.id,
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
      }),
    );

    console.log('Saving package items:', packageItems);
    const savedItems = await this.packageItemRepository.save(packageItems);
    console.log('Package items saved:', savedItems.length);

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
      where: {
        id: In(assignPackageDto.userIds),
        companyId,
      },
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

  // Mobile User Methods
  async getMyPackages(userId: string): Promise<UserPackage[]> {
    return this.userPackageRepository.find({
      where: { userId },
      relations: [
        'package',
        'package.packageItems',
        'package.packageItems.inventoryItem',
        'redemptions',
        'redemptions.inventoryItem',
      ],
      order: { assignedDate: 'DESC' },
    });
  }

  async getUserPackageDetails(
    userPackageId: string,
    userId: string,
  ): Promise<UserPackage> {
    const userPackage = await this.userPackageRepository.findOne({
      where: { id: userPackageId, userId },
      relations: [
        'package',
        'package.packageItems',
        'package.packageItems.inventoryItem',
        'redemptions',
        'redemptions.inventoryItem',
      ],
    });

    if (!userPackage) {
      throw new NotFoundException('Package not found');
    }

    return userPackage;
  }

  async redeemItem(
    userPackageId: string,
    redeemItemDto: RedeemItemDto,
    userId: string,
  ): Promise<Redemption> {
    // Get user package
    const userPackage = await this.getUserPackageDetails(userPackageId, userId);

    // Check if package is active
    if (userPackage.status !== 'active') {
      throw new ForbiddenException('Package is not active');
    }

    // Find the package item
    const packageItem = userPackage.package.packageItems.find(
      (item) => item.inventoryItemId === redeemItemDto.inventoryItemId,
    );

    if (!packageItem) {
      throw new NotFoundException('Item not found in package');
    }

    // Calculate total redeemed so far for this item
    const totalRedeemed = userPackage.redemptions
      .filter((r) => r.inventoryItemId === redeemItemDto.inventoryItemId)
      .reduce((sum, r) => sum + r.quantity, 0);

    // Check if user has enough remaining
    const remaining = packageItem.quantity - totalRedeemed;
    if (redeemItemDto.quantity > remaining) {
      throw new ForbiddenException(
        `Only ${remaining} item(s) remaining to redeem`,
      );
    }

    // Create redemption
    const redemption = this.redemptionRepository.create({
      userPackageId,
      inventoryItemId: redeemItemDto.inventoryItemId,
      quantity: redeemItemDto.quantity,
      redeemedByUserId: userId,
      notes: redeemItemDto.notes,
    });

    const savedRedemption = await this.redemptionRepository.save(redemption);

    // Check if package is fully redeemed
    const allRedemptions = await this.redemptionRepository.find({
      where: { userPackageId },
    });

    const totalPackageRedeemed = userPackage.package.packageItems.every(
      (item) => {
        const itemRedeemed = allRedemptions
          .filter((r) => r.inventoryItemId === item.inventoryItemId)
          .reduce((sum, r) => sum + r.quantity, 0);
        return itemRedeemed >= item.quantity;
      },
    );

    if (totalPackageRedeemed) {
      userPackage.status = 'completed' as any;
      userPackage.completedDate = new Date();
      await this.userPackageRepository.save(userPackage);
    }

    return this.redemptionRepository.findOne({
      where: { id: savedRedemption.id },
      relations: ['inventoryItem'],
    }) as Promise<Redemption>;
  }
}
